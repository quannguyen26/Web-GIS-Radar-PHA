import React, { useEffect, useRef } from "react";
import { productLegendConfigs } from "../../lib/config/legendConfigs.js";
import L from "leaflet";

const ProductLegend = ({ activeProduct }) => {
  const config = productLegendConfigs[activeProduct];
  const containerRef = useRef(null);

  // Ngăn lan truyền sự kiện click/scroll xuống bản đồ Leaflet
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      L.DomEvent.disableClickPropagation(el);
      L.DomEvent.disableScrollPropagation(el);
    }
  }, [config]);

  return (
    <>
      {config && (
        <div
          ref={containerRef}
          className="animate-in fade-in slide-in-from-right-2 absolute bottom-3 left-1.5 z-1000 w-11 rounded-lg border border-slate-200 bg-white/90 p-1.5 shadow-2xl backdrop-blur-md duration-300 sm:bottom-4 sm:left-2 sm:w-13 sm:rounded-xl sm:p-2 md:right-4 md:bottom-5 md:left-auto md:w-16 md:rounded-xl md:p-2.5 dark:border-slate-800 dark:bg-slate-900/90"
        >
          {/* Header  */}
          <div className="mb-1 flex flex-col items-center gap-1.5 pb-1.5 sm:gap-2 sm:pb-2">
            <span className="text-[10px] font-black tracking-tighter text-slate-400 sm:text-[11px] md:text-[13px] dark:text-slate-500">
              {config.unit}
            </span>

            <div className="flex h-36 items-stretch gap-1 sm:h-44 sm:gap-1.5 md:h-64 md:gap-2">
              {/* Color Bar Gradient */}
              <div
                className="w-2 shrink-0 overflow-hidden rounded-sm border border-black/5 shadow-inner sm:w-2.5 md:w-3 dark:border-white/10"
                style={{
                  background: `linear-gradient(to top, ${config.steps.map((s) => s.color).join(",")})`,
                }}
              />

              {/* Labels Column */}
              <div className="relative flex flex-1 flex-col-reverse justify-between py-0.5">
                {config.steps.map((step, i) => {
                  // Hiển thị mốc đầu, mốc cuối và các mốc chẵn để tránh rối mắt trên màn hình nhỏ
                  const showLabel =
                    i === 0 || i === config.steps.length - 1 || i % 2 === 0;

                  return (
                    <div
                      key={i}
                      className="flex h-px items-center leading-none"
                    >
                      {showLabel && (
                        <>
                          <span className="text-[7px] font-bold text-slate-500 tabular-nums sm:text-[8px] md:text-[11px] dark:text-slate-400">
                            {step.value}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(ProductLegend);
