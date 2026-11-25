import {
  listOrganizations,
  listRolesByCodes,
  listTitles,
} from "../services/lookupService.js";
import { CREATABLE_ROLES } from "../middleware/authMiddleware.js";

// GET /api/lookups
// Options for the user form, already limited to what the caller may choose:
//   roles         → only roles the caller may create/assign
//   organizations → SYSTEM_ADMIN: every active one; ADMIN: only their own
//   titles        → all, each with the organizationType it fits
//                   (null = every type), so the form can filter them
export const getLookups = async (req, res) => {
  try {
    const roleCodes = CREATABLE_ROLES[req.user.roleCode] ?? [];
    const organizationId =
      req.user.roleCode === "SYSTEM_ADMIN" ? null : req.user.organizationId;

    const [roles, titles, organizations] = await Promise.all([
      listRolesByCodes(roleCodes),
      listTitles(),
      listOrganizations({ organizationId }),
    ]);

    return res.status(200).json({
      roles,
      titles: titles.map((t) => ({
        id: t.id,
        code: t.code,
        name: t.name,
        organizationType: t.organization_type,
      })),
      organizations: organizations.map((o) => ({
        id: o.id,
        code: o.code,
        name: o.name,
        organizationType: o.organization_type,
      })),
    });
  } catch (error) {
    console.error("Lỗi khi gọi getLookups", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
