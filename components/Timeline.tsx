import { Clock, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";

export default function Timeline({ items }: { items: string[] }) {
  const [now, setNow] = useState<string | null>(null);
  const [times, setTimes] = useState<string[] | null>(null);

  useEffect(() => {
    const current = new Date();
    setNow(current.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    const computed = items.map((_, index) =>
      new Date(current.getTime() - (items.length - index) * 3600000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    setTimes(computed);
  }, [items]);

  const getIcon = (index: number) => {
    if (index === 0) return <CheckCircle className="h-4 w-4 text-cisco-green" />;
    if (index === items.length - 1) return <AlertCircle className="h-4 w-4 text-cisco-blue" />;
    return <Info className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="space-y-5">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-3 relative">
          {/* Left side timeline with connector */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-sm 
                ${index === 0 ? "bg-cisco-green/10 border-cisco-green" : 
                  index === items.length - 1 ? "bg-cisco-sky/10 border-cisco-blue" :
                  "bg-gray-100 border-gray-200"}`}
            >
              {getIcon(index)}
            </div>
            {index < items.length - 1 && (
              <div
                className={`w-0.5 flex-1 mt-1 
                  ${index < items.length - 1 ? "bg-cisco-blue/40" : "bg-gray-200"}`}
              ></div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pt-1">
            <p className="text-sm font-medium text-gray-800 leading-relaxed">{item}</p>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500 font-medium">
                {times ? times[index] : "—"}
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Current time marker */}
      {now && (
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-cisco-green/10 flex items-center justify-center border-2 border-cisco-green shadow-sm">
              <CheckCircle className="h-4 w-4 text-cisco-green" />
            </div>
          </div>
          <div className="flex-1 pt-1">
            <p className="text-sm font-medium text-gray-800 leading-relaxed">Current Time</p>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500 font-medium">{now}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
