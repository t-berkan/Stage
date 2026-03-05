import { MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  day: string;
  dayNumber: number;
  title: string;
  duration: string;
  building: string;
  room: string;
  startTime: string;
  endTime: string;
  isCancelled?: boolean;
  variant?: "pink" | "green";
}

export function CourseCard({
  day,
  dayNumber,
  title,
  duration,
  building,
  room,
  startTime,
  endTime,
  isCancelled = false,
  variant = "pink",
}: CourseCardProps) {
  return (
    <div
      className={cn(
        "flex gap-2.5 p-2 rounded-2xl transition-all duration-200 border-none group",
        isCancelled ? "bg-red-50" : "bg-white shadow-soft hover:shadow-havel"
      )}
    >
      {/* Date badge */}
      <div className={cn(
        "flex flex-col items-center justify-center w-[50px] h-[50px] rounded-[10px] shrink-0 transition-transform duration-300 group-hover:scale-105",
        isCancelled ? "bg-red-100 text-red-500" :
          variant === "green" ? "bg-success/10 text-success" : "bg-pink/10 text-pink"
      )}>
        <span className="text-[9px] font-bold uppercase tracking-wide">{day}</span>
        <span className="text-[20px] font-extrabold leading-none mt-0.5">{dayNumber}</span>
      </div>

      {/* Course info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-start justify-between gap-1.5 mb-0.5">
          <h3 className={cn(
            "font-bold text-[13px] text-navy truncate tracking-tight",
            isCancelled && "line-through text-muted-foreground"
          )}>
            {title}
          </h3>
          <span className="text-[10px] font-medium text-gray-400 shrink-0 mt-0.5">{duration}</span>
        </div>

        {isCancelled && (
          <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold bg-cancelled/20 text-cancelled rounded mt-0.5 self-start">
            Cancelled
          </span>
        )}

        <div className="flex items-center gap-1.5 mt-1 overflow-hidden">
          <div className="flex items-center gap-1 bg-teal/10 px-1 py-0.5 rounded text-teal shrink-0">
            <MapPin className="w-[10px] h-[10px]" />
            <span className="text-[9px] font-bold">{building}</span>
            <span className={cn(
              "text-[9px] font-medium",
              isCancelled ? "text-cancelled/80" : "text-teal/80"
            )}>{room}</span>
          </div>

          <div className="flex items-center gap-1 text-gray-400 border-l pl-1.5 border-gray-100 min-w-0 pr-1">
            <Clock className="w-[10px] h-[10px] shrink-0" />
            <div className="flex items-center gap-1 truncate text-[9px]">
              <span className="font-medium text-gray-500">{startTime}</span>
              <span className="text-gray-300">→</span>
              <span className="font-medium text-gray-500">{endTime}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}