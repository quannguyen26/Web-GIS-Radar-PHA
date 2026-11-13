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
// Event handler for each feature (Hover highlight and Tooltip binding)
const createOnEachFeature = (
  isDistrictLayer = false,
  baseStyle = {},
  hoverStyle,
) => {
  return (feature, layer) => {
    const name = getFeatureDisplayName(feature, isDistrictLayer);
    // Bind interactive tooltip on hover. Styling is managed in index.css (.wfs-feature-tooltip) to support dark mode and override Leaflet defaults.
    layer.bindTooltip(name, {
      permanent: false,
      direction: "top",
      sticky: true,
      interactive: false,
      offset: [0, -5],
      className: "wfs-feature-tooltip",
    });
    // Mouse events for hover styling
    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle(hoverStyle);
        // if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        //   target.bringToFront();
        // }
      },
      mouseout: (e) => {
        const target = e.target;
        target.setStyle(baseStyle);
        target.closeTooltip();
      },
    });
  };
};

export default createOnEachFeature;
