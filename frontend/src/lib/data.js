import {
  Zap,
  Server,
  Palette,
  MapPin,
  ShieldCheck,
  Globe,
  Activity,
  Code,
  Cpu,
  Compass,
} from "lucide-react";

export const defaultSelections = {
  project: {
    name: "Dự án Alpha",
    icon: Zap,
    color: "text-amber-400",
  },
  env: {
    name: "Production",
    icon: Server,
    color: "text-blue-500",
  },
  team: {
    name: "Design Team",
    icon: Palette,
    color: "text-pink-500",
  },
  region: {
    name: "Châu Á (APAC)",
    icon: MapPin,
    color: "text-emerald-500",
  },
};

export const dropdownConfigs = [
  {
    id: "project",
    label: "Dự án",
    options: [
      {
        name: "Dự án Alpha",
        icon: Zap,
        color: "text-amber-400",
      },
      {
        name: "Bảo mật",
        icon: ShieldCheck,
        color: "text-emerald-400",
      },
      {
        name: "Thị trường",
        icon: Globe,
        color: "text-blue-400",
      },
    ],
  },
  {
    id: "env",
    label: "Môi trường",
    options: [
      {
        name: "Production",
        icon: Server,
        color: "text-blue-500",
      },
      {
        name: "Staging",
        icon: Activity,
        color: "text-purple-500",
      },
      {
        name: "Development",
        icon: Code,
        color: "text-slate-500",
      },
    ],
  },
  {
    id: "team",
    label: "Đội ngũ",
    options: [
      {
        name: "Design Team",
        icon: Palette,
        color: "text-pink-500",
      },
      {
        name: "Engineering",
        icon: Cpu,
        color: "text-indigo-500",
      },
    ],
  },
  {
    id: "region",
    label: "Khu vực",
    options: [
      {
        name: "Châu Á (APAC)",
        icon: MapPin,
        color: "text-emerald-500",
      },
      {
        name: "Bắc Mỹ (NA)",
        icon: Compass,
        color: "text-rose-500",
      },
    ],
  },
];
