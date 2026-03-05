import { MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleEventProps {
  title: string;
  building: string;
  room: string;
  startTime: string;
  endTime: string;
  isCancelled?: boolean;
  centerTitle?: boolean;
}

export function ScheduleEvent({
  title,
  building,
  room,
  startTime,
  endTime,
  isCancelled = false,
  centerTitle = false,
}: ScheduleEventProps) {
  const startHour = parseTime(startTime);
  const endHour = parseTime(endTime);
  const duration = endHour - startHour;
  const durationLabel = `${duration}h.`;

  return (
    <div
      className={cn(
        "h-full rounded-2xl border transition-all cursor-pointer flex flex-col overflow-hidden",
        duration <= 1 ? "p-2.5" : "p-3.5",
        isCancelled
          ? "bg-white border-cancelled"
          : "bg-white border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.06)]"
      )}
    >
      {/* Title row */}
      <div className={cn("flex items-start gap-2 relative", duration <= 1 ? "mb-1.5" : "mb-2", centerTitle ? "justify-center w-full" : "justify-between")}>
        <div className={cn("flex items-center gap-2 flex-wrap min-w-0", centerTitle ? "justify-center text-center" : "")}>
          <h3 className={cn("font-bold text-navy leading-tight truncate", centerTitle ? "text-[16px]" : "text-[13px]")}>
            {title}
          </h3>
          {isCancelled && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-cancelled rounded leading-none mt-0.5">
              Cancelled
            </span>
          )}
        </div>
        <span className={cn("text-[12px] text-gray-300 font-medium shrink-0 pt-0.5", centerTitle ? "absolute right-0 top-0" : "")}>{durationLabel}</span>
      </div>

      {/* Location */}
      <div className={cn("flex items-center gap-1.5", duration > 1 ? "mt-auto" : "mt-0", centerTitle ? "justify-center" : "")}>
        <div className="flex items-center gap-1 bg-teal/10 px-1.5 py-0.5 rounded text-teal">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="text-[11px] font-bold">{building}</span>
        </div>
        <div className="flex items-center bg-teal/10 px-1.5 py-0.5 rounded text-teal">
          <span className="text-[11px] font-bold">{room}</span>
        </div>
      </div>

      {/* Time */}
      {duration > 1 && (
        <div className={cn("flex items-center gap-1.5 mt-2", centerTitle ? "justify-center" : "")}>
          <Clock className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span className="text-[11px] font-bold text-navy">
            {startTime} <span className="text-gray-400 font-medium mx-1">-</span> {endTime}
          </span>
        </div>
      )}
    </div>
  );
}

function parseTime(time: string) {
  const match = time.match(/(\d+)h?(\d+)?/i);
  if (!match) return 8;
  let hour = parseInt(match[1]);
  const minutes = match[2] ? parseInt(match[2]) : 0;
  return hour + (minutes / 60);
}