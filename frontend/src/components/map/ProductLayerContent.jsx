import React, { useEffect, useState } from "react";
import { WMSTileLayer } from "react-leaflet";
import L from "leaflet";
import AnimationControl from "../ui/AnimationControl";
import ProductLegend from "../ui/ProductLegend";
import GetMapInfoHandler from "./GetMapInfoHandler";
import { GEOSERVER_WMSC_URL, API_BASE_URL } from "../../lib/constants";

/**
 * Nội dung layer sản phẩm radar: kết nối SSE, quản lý timeline,
 * và render WMSTileLayer + các UI control liên quan.
 */
const ProductLayerContent = ({ product }) => {
  const [timeline, setTimeline] = useState({ list: [], index: 0 });

  useEffect(() => {
    const eventSource = new EventSource(
      `${API_BASE_URL}/time?product=${product}`,
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
      {timeline.list.map((time, idx) => (
        <WMSTileLayer
          key={`${product}-${time}`}
          url={GEOSERVER_WMSC_URL}
          opacity={idx === timeline.index ? 1 : 0}
          params={{
            layers: `radar:${product.toLowerCase()}_mosaic_index`,
            format: "image/png",
            transparent: true,
            version: "1.1.1",
            time: time,
            pane: "paneRadar",
            crs: L.CRS.EPSG3857,
          }}
        />
      ))}
      <GetMapInfoHandler timeline={timeline} />
      <AnimationControl timeline={timeline} setTimeline={setTimeline} />
      <ProductLegend activeProduct={product} />
    </>
  );
};

export default ProductLayerContent;
