import { MousePointerClick, Newspaper, Settings, Users } from "lucide-react";

export const buttonNavItems = [
  {
    name: "Bản đồ",
    icon: MousePointerClick,
    active: true,
  },
  { name: "Bản tin", icon: Newspaper, active: false },
  { name: "Trạng thái hệ thống", icon: Settings, active: false },
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
