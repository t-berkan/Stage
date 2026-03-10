import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ScheduleHeaderProps {
  currentDate: Date;
  view: "day" | "week" | "month";
  onViewChange: (view: "day" | "week" | "month") => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onDateSelect: (date: Date) => void;
}

export function ScheduleHeader({
  currentDate,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  onDateSelect,
}: ScheduleHeaderProps) {
  const formatMonth = () => {
    return format(currentDate, "MMMM yyyy", { locale: fr });
  };

  const formatDateRange = () => {
    if (view === "day") {
      return format(currentDate, "d MMM yyyy", { locale: fr });
    }
    if (view === "month") {
      return format(currentDate, "MMMM yyyy", { locale: fr });
    }
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${format(start, "d MMM", { locale: fr })} - ${format(end, "d MMM yyyy", { locale: fr })}`;
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4 md:gap-0">
      {/* Left: Month + Today button + Navigation */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
        <h1 className="text-base font-semibold text-navy capitalize min-w-[100px] md:min-w-[140px]">{formatMonth()}</h1>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="text-xs font-medium h-7 px-2 md:px-3 border-gray-300 rounded-lg text-gray-600 mr-1"
            title="Aujourd'hui"
          >
            <span className="hidden md:inline">Aujourd'hui</span>
            <span className="inline md:hidden">Auj.</span>
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7 border-gray-300 shrink-0" onClick={onPrevious}>
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7 border-gray-300 shrink-0" onClick={onNext}>
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </Button>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              size="sm"
              className="h-7 border-gray-300 text-gray-600 font-normal px-2 md:px-3"
              title="Choisir une date"
            >
              <CalendarIcon className="md:mr-2 h-3.5 w-3.5" />
              <span className="hidden md:inline">Choisir une date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(date) => date && onDateSelect(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Right: View tabs + Date range */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto mt-1 md:mt-0">
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5">
          {(["Day", "Week", "Month"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v.toLowerCase() as "day" | "week" | "month")}
              className={cn(
                "px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium rounded-md transition-all",
                view === v.toLowerCase()
                  ? "bg-white text-navy shadow-sm"
                  : "text-gray-400 hover:text-navy"
              )}
            >
              {v === "Day" ? "Jour" : v === "Week" ? "Semaine" : "Mois"}
            </button>
          ))}
        </div>

        <div className="border border-gray-200 rounded-lg px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium text-navy bg-white min-w-[120px] md:min-w-[140px] text-center grow md:grow-0">
          {formatDateRange()}
        </div>
      </div>
    </div>
  );
}