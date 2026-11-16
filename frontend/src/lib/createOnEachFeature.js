import L from "leaflet";
import escapeHtml from "./escapeHtml";

// Build the tooltip HTML for a feature. Property values come from GeoServer,
// so they are escaped; only the <br> added here is trusted markup.
const getFeatureDisplayName = (feature, isDistrict = false) => {
  if (!feature || !feature.properties) return "Không có tên";
  const p = feature.properties;
  if (isDistrict) {
    const districtName = p.tenxa || p.xa_gop || p.ten_xa;
    const districtType = p.loaixa ? `${escapeHtml(p.loaixa)} ` : "";
    const provinceName = escapeHtml(p.tentinh || p.ten_tinh || "");
    if (districtName) {
      return provinceName
        ? `${districtType}${escapeHtml(districtName)}<br>(${provinceName})`
        : `${districtType}${escapeHtml(districtName)}`;
    }
  }

  const typeProvince = escapeHtml(p.captinh || p.cap_tinh || p.loaitinh || "");
  const nameProvince = escapeHtml(p.tentinh || p.ten_tinh || "");
  if (typeProvince && nameProvince) {
    return `${typeProvince} ${nameProvince}`.trim();
  }
  return nameProvince || "Đơn vị hành chính";
};

// True when the primary input cannot hover (phones, tablets). On these devices
// Leaflet opens tooltips on tap and never receives mouseout, so the tooltip and
// hover style get stuck and overlap the GetFeatureInfo popup.
const isHoverlessDevice = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(hover: none)").matches;

// Event handler for each feature (hover highlight + tooltip).
// The tooltip is managed manually instead of using layer.bindTooltip():
// Leaflet's bound tooltip queues a re-open on 'moveend' for every feature the
// cursor crosses while the map is dragged, which leaves several stale tooltips
// stuck on the map after the drag ends.
const createOnEachFeature = (
  isDistrictLayer = false,
  baseStyle = {},
  hoverStyle,
) => {
  return (feature, layer) => {
    // Touch devices: skip tooltip and hover style, the click popup
    // (GetMapInfoHandler) already shows the commune and province names
    if (isHoverlessDevice()) return;

    // Styling is managed in index.css (.wfs-feature-tooltip) to support dark
    // mode and override Leaflet defaults.
    const tooltip = L.tooltip({
      direction: "top",
      interactive: false,
      offset: [0, -5],
      className: "wfs-feature-tooltip",
    }).setContent(getFeatureDisplayName(feature, isDistrictLayer));

    const isMapDragging = () => Boolean(layer._map?.dragging?.moving());

    layer.on({
      mouseover: (e) => {
        // Ignore features crossed while dragging the map
        if (!layer._map || isMapDragging()) return;
        layer.setStyle(hoverStyle);
        tooltip.setLatLng(e.latlng).openOn(layer._map);
      },
      // Follow the cursor (sticky tooltip)
      mousemove: (e) => {
        if (tooltip.isOpen()) tooltip.setLatLng(e.latlng);
      },
      mouseout: () => {
        layer.setStyle(baseStyle);
        tooltip.close();
      },
      // Layer removed (e.g. GeoJSON re-created on theme/zoom change)
      remove: () => tooltip.close(),
    });
  };
};

export default createOnEachFeature;
