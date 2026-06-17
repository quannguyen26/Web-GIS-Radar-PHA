import {
  Server,
  MapPin,
  SatelliteDish,
  MousePointerClick,
  Newspaper,
  Settings,
} from "lucide-react";

export const defaultSelections = {
  stations: {
    name: "Pha Đin",
  },
  products: {
    name: "MAX",
  },
  region: {
    name: "Cấp tỉnh",
  },
};

export const dropdownConfigs = [
  {
    id: "stations",
    label: "Trạm Ra đa thời tiết",
    icon: SatelliteDish,
    iconColor: "text-amber-400",
    options: [
      {
        name: "Pha Đin",
        location: [21.57139, 103.51694],
        status: "active",
      },
      {
        name: "Việt Trì",
        location: [21.41944, 105.30472],
        status: "deactive",
      },
      {
        name: "Phù Liễn",
        location: [20.809, 106.64],
        status: "deactive",
      },
    ],
  },
  {
    id: "products",
    label: "Sản phẩm",
    icon: Server,
    iconColor: "text-blue-500",
    options: [
      {
        name: "MAX",
        status: "active",
      },
      {
        name: "HMAX",
        status: "active",
      },
      {
        name: "VIL",
        status: "deactive",
      },
    ],
  },
  {
    id: "region",
    label: "Lớp hành chính",
    icon: MapPin,
    iconColor: "text-emerald-500",
    options: [
      {
        name: "Cấp tỉnh",
        status: "active",
      },
      {
        name: "Cấp xã",
        status: "active",
      },
      {
        name: "Điểm dự báo",
        status: "active",
      }
    ],
  },
];

export const buttonNavItems = [
  {
    name: "Bàn đồ",
    icon: MousePointerClick,
    active: true,
  },
  { name: "Bản tin", icon: Newspaper, active: false },

  { name: "Trạng thái hệ thống", icon: Settings, active: false },
];

export const productLegendConfigs = {
  MAX: {
    unit: "dBZ",
    type: "gradient",
    steps: [
      { value: 2, color: "#003CFF" },
      { value: 7, color: "#00C7C7" },
      { value: 12, color: "#00A8AC" },
      { value: 18, color: "#008261" },
      { value: 21, color: "#009637" },
      { value: 24, color: "#00C027" },
      { value: 28, color: "#00E80A" },
      { value: 34, color: "#24FF24" },
      { value: 37, color: "#FFFF1E" },
      { value: 39, color: "#FFE600" },
      { value: 44, color: "#FFBC00" },
      { value: 50, color: "#FF9800" },
      { value: 53, color: "#FF5E00" },
      { value: 55, color: "#F20F00" },
      { value: 60, color: "#BB003A" },
      { value: 66, color: "#FF00FF" },
    ],
  },
  HMAX: {
    unit: "Km",
    type: "gradient",
    steps: [
      { value: 0, color: "#003CFF" },
      { value: 1, color: "#00C7C7" },
      { value: 2, color: "#00A8AC" },
      { value: 3, color: "#008261" },
      { value: 4, color: "#009637" },
      { value: 5, color: "#00C027" },
      { value: 6, color: "#00E80A" },
      { value: 7, color: "#24FF24" },
      { value: 8, color: "#FFFF1E" },
      { value: 9, color: "#FFE600" },
      { value: 10, color: "#FFBC00" },
      { value: 11, color: "#FF9800" },
      { value: 12, color: "#FF5E00" },
      { value: 13, color: "#F20F00" },
      { value: 14, color: "#BB003A" },
    ],
  },
  VIL: {
    unit: "kg/m²",
    type: "gradient",
    steps: [
      { value: 0, color: "#f7fcf5" },
      { value: 20, color: "#74c476" },
      { value: 40, color: "#238b45" },
      { value: 60, color: "#00441b" },
    ],
  },
};
