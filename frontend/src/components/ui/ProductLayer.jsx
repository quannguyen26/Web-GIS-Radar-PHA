import React, { useEffect, useState, useRef, useMemo } from "react";
import { WMSTileLayer } from "react-leaflet";
import L from "leaflet";
import { useSelection } from "../context/SelectionContext";
import AnimationControl from "../ui/AnimationControl";
import ProductLegend from "./ProductLegend";
import GetMapInfoHandler from "../handler/GetMapInfoHandler";

// Sử dụng .memo để tránh parent render
const ProductLayer = React.memo(() => {
  const { selections } = useSelection();
  const productName = selections.products.name;

  // Sử dụng useMemo để đảm bảo ProductLayerContent chỉ render lại khi sản phẩm thực sự thay đổi
  return useMemo(
    () => <ProductLayerContent key={productName} product={productName} />,
    [productName],
  );
});

const ProductLayerContent = ({ product }) => {
  const [timeline, setTimeline] = useState({ list: [], index: 0 });

  useEffect(() => {
    const eventSource = new EventSource(
      `http://localhost:5001/api/time?product=${product}`,
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Trường hợp 1: Nhận dữ liệu khởi tạo (danh sách 6 mốc)
        if (data.timestamps) {
          setTimeline({
            list: data.timestamps,
            index: data.timestamps.length - 1,
          });
        }
        // Trường hợp 2: Nhận cập nhật mốc thời gian mới duy nhất
        else if (data.newTimestamp) {
          console.log(`Cập nhật mốc mới cho [${product}]:`, data.newTimestamp);
          setTimeline((prev) => {
            if (prev.list.includes(data.newTimestamp)) return prev;

            const newList = [...prev.list, data.newTimestamp].slice(-6);
            let newIndex = prev.index;

            if (prev.index === prev.list.length - 1) {
              newIndex = newList.length - 1;
            } else {
              newIndex = Math.max(0, prev.index - 1);
            }

            return { list: newList, index: newIndex };
          });
        }
      } catch (err) {
        console.error("Lỗi parse dữ liệu SSE:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Lỗi kết nối SSE:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [product]);

  if (!timeline.list || timeline.list.length === 0) return null;

  return (
    <>
      {console.log(`[RENDER] ProductLayerContent for: ${product}`)}
      <WMSTileLayer
        key={`${product}-${timeline.list[timeline.index]}`}
        url="https://radarphadin.com.vn/geoserver/radar/gwc/service/wms"
        params={{
          layers: `radar:${product.toLowerCase()}_mosaic_index`,
          format: "image/png",
          transparent: true,
          version: "1.1.1",
          time: timeline.list[timeline.index],
          pane: "paneRadar",
          crs: L.CRS.EPSG3857,
        }}
      />
      <GetMapInfoHandler timeline={timeline} />

      <AnimationControl timeline={timeline} setTimeline={setTimeline} />

      <ProductLegend activeProduct={product} />
    </>
  );
};

export default ProductLayer;
