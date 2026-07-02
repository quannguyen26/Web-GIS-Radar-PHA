import { Server, MapPin, SatelliteDish } from "lucide-react";

export const defaultSelections = {
  stations: {
    name: "Pha Đin",
  },
  products: {
    name: "MAX",
  },
  region: {
    name: "Sơn La",
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
        centerLocation: [
          [17.188278988000036, 102.14388732800006],
          [26.392738122000026, 108.19501653500004],
        ],
      },
      {
        name: "Sơn La",
        status: "active",
        centerLocation: [
          [20.63, 103.18],
          [22.02, 105.03],
        ],
      },
      {
        name: "Điện Biên",
        status: "active",
        centerLocation: [
          [20.9, 102.15],
          [22.55, 103.45],
        ],
      },
      {
        name: "Lai Châu",
        status: "active",
        centerLocation: [
          [21.68, 102.33],
          [22.83, 103.98],
        ],
      },
      {
        name: "Lào Cai",
        status: "active",
        centerLocation: [22.012812114229767, 104.37189465388656],
      },
    ],
  },
];
