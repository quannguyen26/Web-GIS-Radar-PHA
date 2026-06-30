import { Server, MapPin, SatelliteDish } from "lucide-react";

export const defaultSelections = {
  stations: {
    name: "Pha Đin",
  },
  products: {
    name: "MAX",
  },
  region: {
    name: "Bắc Bộ",
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
    label: "Vị trí",
    icon: MapPin,
    iconColor: "text-emerald-500",
    options: [
      {
        name: "Bắc Bộ",
        status: "active",
      },
      {
        name: "Sơn La",
        status: "active",
      },
      {
        name: "Điện Biên",
        status: "active",
      },
      {
        name: "Lai Châu",
        status: "active",
      },
      {
        name: "Lào Cai",
        status: "active",
      },
    ],
  },
];
