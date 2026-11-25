import { MousePointerClick, Newspaper, Settings, Users } from "lucide-react";

// Items with a path are links (highlighted while that page is open);
// items without one are not built yet.
export const buttonNavItems = [
  { name: "Bản đồ", icon: MousePointerClick, path: "/" },
  { name: "Bản tin", icon: Newspaper },
  { name: "Trạng thái hệ thống", icon: Settings },
];

// Role codes allowed into the admin area (must match roles.code in the DB)
export const ADMIN_ROLES = ["SYSTEM_ADMIN", "ADMIN"];

// Admin menu items: each one is shown only when user.roleCode is in allowedRoles
export const adminNavItems = [
  {
    name: "Quản lý người dùng",
    icon: Users,
    path: "/admin/users",
    allowedRoles: ADMIN_ROLES,
  },
];
