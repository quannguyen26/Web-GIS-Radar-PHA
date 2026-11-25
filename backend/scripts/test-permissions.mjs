// Permission checks for phase 1 (cases A–F of docs/Kiem-thu-phan-quyen.md).
//
// Usage, with the backend running (npm run dev), from the repo root:
//   node backend/scripts/test-permissions.mjs [path/to/test-accounts.local]
// Optional: API_URL=http://localhost:5001/api
//
// Only for a LOCAL/DEV database: it creates two temporary accounts
// (t18_user_*, t18_admin_*) and locks them when done.
// Reads passwords from test-accounts.local (gitignored) and never prints them.
// It signs in 9 times; the signin rate limit is 10 per 15 minutes per IP,
// so restart the backend before running it twice in a row.
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.API_URL ?? "http://localhost:5001/api";
const accountsFile =
  process.argv[2] ??
  path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "test-accounts.local",
  );
const text = fs.readFileSync(accountsFile, "utf8");
const pw = (u) =>
  text.match(new RegExp(`username=${u}\\s+password=(\\S+)`))?.[1];

const results = [];
const check = (id, name, ok, extra = "") => {
  results.push({ id, ok });
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${id}  ${name}${extra !== "" ? "  → " + extra : ""}`,
  );
};

const call = async (method, path, token, body, cookie) => {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty */
  }
  const setCookie = res.headers
    .getSetCookie()
    .find((c) => c.startsWith("refreshToken="));
  return { status: res.status, data, cookie: setCookie?.split(";")[0] };
};
const signinRaw = (username, password) =>
  call("POST", "/auth/signin", null, { username, password });
const signin = async (u) => (await signinRaw(u, pw(u))).data?.accessToken;
const refresh = (cookie) => call("POST", "/auth/refresh", null, null, cookie);

const SA = await signin("test_sysadmin");
// test_admin's sign-in doubles as case A1 (saves one call against the rate limit)
const adminSignin = await signinRaw("test_admin", pw("test_admin"));
const AD = adminSignin.data?.accessToken;
const US = await signin("test_user17");
if (!SA || !AD || !US) {
  throw new Error(
    "Cannot sign in the test accounts (rate limit? wrong password?)",
  );
}

const me = async (t) => (await call("GET", "/users/me", t)).data.user;
const saMe = await me(SA);
const adMe = await me(AD);
const lk = (await call("GET", "/lookups", SA)).data;
const role = (code) => lk.roles.find((r) => r.code === code)?.id;
const QTV = lk.titles.find((t) => t.code === "QTV").id;
const DBV = lk.titles.find((t) => t.code === "DBV").id;
const ownOrg = adMe.organizationId;
const otherProv = lk.organizations.find(
  (o) => o.organizationType === "PROVINCIAL_STATION",
);
const titleFor = (org) =>
  org.organizationType === "PROVINCIAL_STATION" ? DBV : QTV;

const allUsers = (await call("GET", "/users", SA)).data.users;
const adminSonla = allUsers.find((u) => u.username === "admin_sonla");

// ---------- A. Sign-in and sessions ----------
let r = adminSignin;
check(
  "A1",
  "signin OK → 200 + token + cookie",
  r.status === 200 && !!r.data?.accessToken && !!r.cookie,
  r.status,
);
r = await signinRaw("test_admin", "wrong-" + crypto.randomUUID());
check("A2", "wrong password → 401", r.status === 401, r.status);
r = await call("GET", "/users");
check("A3", "no token → 401", r.status === 401, r.status);
r = await call("GET", "/users/me", US);
check(
  "A4",
  "USER /users/me → 200, no hash",
  r.status === 200 && !JSON.stringify(r.data).includes("password"),
  r.status,
);

// Temp USER (own org of test_admin) with a known random password
const stamp = Date.now().toString(36);
const tmpPass = crypto.randomBytes(12).toString("base64url");
const tmpName = `t18_user_${stamp}`;
r = await call("POST", "/auth/signup", AD, {
  username: tmpName,
  password: tmpPass,
  fullname: "Thử 1.8 (tạm)",
  title: QTV,
  role: role("USER"),
  organization: ownOrg,
});
check("B3", "ADMIN creates USER in own org → 201", r.status === 201, r.status);
const tmpId =
  r.data?.user?.id ??
  (await call("GET", "/users", SA)).data.users.find(
    (u) => u.username === tmpName,
  )?.id;

const before = (await call("GET", `/users/${tmpId}`, SA)).data.user.lastLogin;
let s = await signinRaw(tmpName, tmpPass);
const after = (await call("GET", `/users/${tmpId}`, SA)).data.user.lastLogin;
check(
  "A9",
  "signin writes last_login",
  !!after && after !== before,
  `${before} → ${after}`,
);

// A5/A6: lock → signin and old refresh refused
r = await call("PATCH", `/users/${tmpId}/active`, AD, { active: false });
check("E1a", "ADMIN locks own-org USER → 200", r.status === 200, r.status);
r = await signinRaw(tmpName, tmpPass);
check(
  "A5",
  "locked account signin → 403",
  r.status === 403,
  `${r.status} ${r.data?.message}`,
);
r = await refresh(s.cookie);
check(
  "A6",
  "locked account old refresh → 403",
  r.status === 403,
  `${r.status} ${r.data?.message}`,
);
r = await call("PATCH", `/users/${tmpId}/active`, AD, { active: true });
check("E1b", "ADMIN unlocks USER → 200", r.status === 200, r.status);
s = await signinRaw(tmpName, tmpPass);
check("E1c", "unlocked user signs in again", s.status === 200, s.status);

// A7 + E4/E5: reset password
r = await call("PUT", `/users/${tmpId}/password`, AD, { password: "short" });
check("E4", "reset password too short → 400", r.status === 400, r.status);
const newPass = crypto.randomBytes(12).toString("base64url");
r = await call("PUT", `/users/${tmpId}/password`, AD, { password: newPass });
check("E5a", "ADMIN resets USER password → 200", r.status === 200, r.status);
r = await refresh(s.cookie);
check("A7", "after reset old refresh → 403", r.status === 403, r.status);
r = await signinRaw(tmpName, tmpPass);
check("E5b", "old password no longer works", r.status === 401, r.status);
s = await signinRaw(tmpName, newPass);
check("E5c", "new password works", s.status === 200, s.status);

// A8 + D6: role change kills sessions
r = await call("PATCH", `/users/${tmpId}`, SA, { role: role("ADMIN") });
check(
  "D6a",
  "SYSTEM_ADMIN USER → ADMIN → 200",
  r.status === 200 && r.data?.user?.roleCode === "ADMIN",
  r.status,
);
r = await refresh(s.cookie);
check("A8", "after role change old refresh → 403", r.status === 403, r.status);
r = await call("PATCH", `/users/${tmpId}`, SA, { role: role("USER") });
check(
  "D6b",
  "SYSTEM_ADMIN ADMIN → USER → 200",
  r.status === 200 && r.data?.user?.roleCode === "USER",
  r.status,
);

// ---------- B. Signup ----------
r = await call("POST", "/auth/signup", SA, {
  username: `t18_admin_${stamp}`,
  password: crypto.randomBytes(12).toString("base64url"),
  fullname: "Admin thử 1.8 (tạm)",
  title: titleFor(otherProv),
  role: role("ADMIN"),
  organization: otherProv.id,
});
check(
  "B1",
  "SYSTEM_ADMIN creates ADMIN in other org → 201",
  r.status === 201,
  `${r.status} ${r.data?.message ?? ""}`,
);
const tmpAdminId = (await call("GET", "/users", SA)).data.users.find(
  (u) => u.username === `t18_admin_${stamp}`,
)?.id;

const fail = (u) => ({ username: u, password: "Abcdefgh123", fullname: "x" });
r = await call("POST", "/auth/signup", SA, {
  ...fail("t18_fail_sa"),
  title: QTV,
  role: saMe.roleId,
  organization: ownOrg,
});
check(
  "B2",
  "SYSTEM_ADMIN creates SYSTEM_ADMIN → 403",
  r.status === 403,
  `${r.status} ${r.data?.message}`,
);
r = await call("POST", "/auth/signup", AD, {
  ...fail("t18_fail_ad"),
  title: QTV,
  role: role("ADMIN"),
  organization: ownOrg,
});
check("B4", "ADMIN creates ADMIN → 403", r.status === 403, r.status);
r = await call("POST", "/auth/signup", AD, {
  ...fail("t18_fail_org"),
  title: DBV,
  role: role("USER"),
  organization: otherProv.id,
});
check(
  "B5",
  "ADMIN creates USER in other org → 403",
  r.status === 403,
  r.status,
);
r = await call("POST", "/auth/signup", US, {
  ...fail("t18_fail_us"),
  title: QTV,
  role: role("USER"),
  organization: ownOrg,
});
check("B6", "USER creates account → 403", r.status === 403, r.status);
r = await call("POST", "/auth/signup", AD, {
  ...fail(tmpName),
  title: QTV,
  role: role("USER"),
  organization: ownOrg,
});
check("B7", "duplicate username → 409", r.status === 409, r.status);
r = await call("POST", "/auth/signup", AD, {
  ...fail("t18_fail_title"),
  title: DBV,
  role: role("USER"),
  organization: ownOrg,
});
check(
  "B8",
  "DBV at radar station → 400",
  r.status === 400,
  `${r.status} ${r.data?.message}`,
);

// ---------- C. List / detail ----------
const orgsSeen = new Set(allUsers.map((u) => u.organizationId).filter(Boolean));
check(
  "C1",
  "SYSTEM_ADMIN sees several orgs",
  orgsSeen.size > 1,
  [...orgsSeen].join(","),
);
r = await call("GET", `/users?organizationId=${otherProv.id}`, SA);
check(
  "C2",
  "SYSTEM_ADMIN filter by org",
  r.status === 200 &&
    r.data.users.length > 0 &&
    r.data.users.every((u) => u.organizationId === otherProv.id),
  r.data?.users?.length,
);
r = await call("GET", `/users?organizationId=${otherProv.id}`, AD);
check(
  "C3",
  "ADMIN list (filter ignored) → own org only",
  r.status === 200 && r.data.users.every((u) => u.organizationId === ownOrg),
  r.status,
);
r = await call("GET", `/users/${adminSonla.id}`, AD);
check("C4", "ADMIN gets other-org user → 403", r.status === 403, r.status);
r = await call("GET", "/users", US);
check("C5", "USER lists users → 403", r.status === 403, r.status);
r = await call("GET", "/users", SA);
check(
  "C6",
  "list has no password hash",
  !JSON.stringify(r.data).match(/password|hash/i),
  "",
);

// ---------- D. Edit ----------
r = await call("PATCH", `/users/${tmpId}`, AD, {
  fullname: "Thử 1.8 (đã sửa)",
  email: "t18@example.com",
  phone: "0123456789",
});
check(
  "D1",
  "ADMIN edits fullname/email/phone → 200",
  r.status === 200,
  r.status,
);
r = await call("PATCH", `/users/${tmpId}`, AD, { role: role("USER") });
const d2a = r.status;
r = await call("PATCH", `/users/${tmpId}`, AD, { organization: ownOrg });
check(
  "D2",
  "ADMIN sends role / organization → 403",
  d2a === 403 && r.status === 403,
  `${d2a}, ${r.status}`,
);
r = await call("PATCH", `/users/${adminSonla.id}`, AD, { fullname: "x" });
check("D3", "ADMIN edits another ADMIN → 403", r.status === 403, r.status);
r = await call("PATCH", `/users/${saMe.id}`, SA, { fullname: "x" });
const d4a = r.status;
r = await call("PATCH", `/users/${saMe.id}`, AD, { fullname: "x" });
check(
  "D4",
  "nobody edits SYSTEM_ADMIN → 403",
  d4a === 403 && r.status === 403,
  `${d4a}, ${r.status}`,
);
r = await call("PATCH", `/users/${tmpId}`, SA, { username: "t18_renamed" });
check("D5", "change username → 400", r.status === 400, r.status);
r = await call("PATCH", `/users/${tmpId}`, SA, { organization: otherProv.id });
check(
  "D7",
  "move QTV user to provincial station → 400",
  r.status === 400,
  `${r.status} ${r.data?.message}`,
);

// ---------- E. Lock rules ----------
r = await call("PATCH", `/users/${adMe.id}/active`, AD, { active: false });
check(
  "E2",
  "lock own account → refused",
  r.status === 400 || r.status === 403,
  r.status,
);
r = await call("PATCH", `/users/${adminSonla.id}/active`, AD, {
  active: false,
});
check("E3", "ADMIN locks other-org ADMIN → 403", r.status === 403, r.status);

// ---------- F. Lookups ----------
check(
  "F1",
  "SYSTEM_ADMIN lookups: ADMIN+USER, all orgs",
  lk.roles
    .map((x) => x.code)
    .sort()
    .join() === "ADMIN,USER" && lk.organizations.length > 1,
  lk.organizations.length,
);
r = await call("GET", "/lookups", AD);
check(
  "F2",
  "ADMIN lookups: only USER, only own org",
  r.data.roles.map((x) => x.code).join() === "USER" &&
    r.data.organizations.length === 1 &&
    r.data.organizations[0].id === ownOrg,
  "",
);
r = await call("GET", "/lookups", US);
check("F3", "USER lookups → 403", r.status === 403, r.status);

// ---------- Cleanup: lock the temp accounts so they cannot be used ----------
await call("PATCH", `/users/${tmpId}/active`, SA, { active: false });
if (tmpAdminId)
  await call("PATCH", `/users/${tmpAdminId}/active`, SA, { active: false });
console.log(`\nTemp accounts locked: ${tmpName}, t18_admin_${stamp}`);

const failed = results.filter((x) => !x.ok).map((x) => x.id);
process.exitCode = failed.length ? 1 : 0;
console.log(
  `${results.length - failed.length} passed, ${failed.length} failed${failed.length ? ": " + failed.join(", ") : ""}`,
);
