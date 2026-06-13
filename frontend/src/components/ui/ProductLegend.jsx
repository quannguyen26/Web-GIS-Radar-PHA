import React from "react";
import { productLegendConfigs } from "../../lib/data.js";

const ProductLegend = ({ activeProduct }) => {
  const config = productLegendConfigs[activeProduct];
  
  return (
    <>
      {config && (
        <div className="absolute w-16 p-2 duration-300 border shadow-2xl animate-in fade-in slide-in-from-right-2 right-2 bottom-16 z-1000 rounded-xl border-slate-200 bg-white/95 backdrop-blur-md md:right-4 md:bottom-10 md:w-20 md:p-3 dark:border-slate-800 dark:bg-slate-900/95">
          {/* Header - Chỉ hiển thị đơn vị */}
          <div className="flex flex-col items-center gap-4 pb-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[14px] font-bold text-slate-500 dark:text-slate-400">
              {config.unit}
            </span>

            <div className="flex items-stretch gap-1 h-45 md:h-82">
              {/* Color Bar Gradient */}
              <div
                className="w-3 overflow-hidden border shadow-inner shrink-0 border-black/5 md:w-4 dark:border-white/5"
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
                      className="flex items-center h-0 gap-1 leading-none"
                    >
                      {showLabel && (
                        <>
                          <div className="w-1 h-px shrink-0 bg-slate-200 dark:bg-slate-700" />
                          <span className="text-[8px] font-bold text-slate-500 tabular-nums md:text-[12px] dark:text-slate-400">
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
