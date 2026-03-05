import { Course } from "@/lib/scheduleData";
import { cn } from "@/lib/utils";
import { format, isSameMonth, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns";
import { fr } from "date-fns/locale";

interface MonthGridProps {
    currentDate: Date;
    courses: Course[];
    onCourseUpdate?: (courses: Course[]) => void;
    onCourseClick?: (course: Course) => void;
}

export function MonthGrid({ currentDate, courses, onCourseClick }: MonthGridProps) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            formattedDate = format(day, dateFormat);
            const cloneDay = day;

            // Calculate dayIndex (0 = Monday, 6 = Sunday)
            const dayIndex = cloneDay.getDay() === 0 ? 6 : cloneDay.getDay() - 1;

            // Filter courses for this specific day
            const dateStr = format(cloneDay, 'yyyy-MM-dd');
            const dayCourses = courses.filter(course => course.date === dateStr);

            days.push(
                <div
                    key={day.toString()}
                    className={cn(
                        "min-h-[120px] p-2 border-r border-b border-gray-100 relative group transition-colors",
                        !isSameMonth(day, monthStart) ? "bg-gray-50/50 text-gray-400" : "bg-white",
                        isSameDay(day, new Date()) ? "bg-blue-50/30" : ""
                    )}
                >
                    <div className="flex justify-between items-start">
                        <span className={cn(
                            "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                            isSameDay(day, new Date()) ? "bg-navy text-white shadow-md" : "text-gray-600"
                        )}>
                            {formattedDate}
                        </span>
                        {dayCourses.length > 0 && (
                            <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded-md">
                                {dayCourses.length} {dayCourses.length > 1 ? "cours" : "cours"}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1 mt-1">
                        {dayCourses.slice(0, 3).map((course, idx) => (
                            <div
                                onClick={() => onCourseClick?.(course)}
                                key={`${course.id}-${idx}`}
                                className={cn(
                                    "text-[10px] truncate px-1.5 py-1 rounded border cursor-pointer hover:brightness-95 transition-all",
                                    course.type === "Spécialisé"
                                        ? "bg-purple-50 text-purple-700 border-purple-100"
                                        : "bg-pink-light/30 text-pink-dark border-pink-light/50"
                                )}
                                title={`${course.startTime} - ${course.title}`}
                            >
                                <span className="font-semibold">{course.startTime.split(' ')[0]}</span> {course.title}
                            </div>
                        ))}
                        {dayCourses.length > 3 && (
                            <div className="text-[10px] text-gray-400 font-medium text-center py-0.5">
                                +{dayCourses.length - 3} autres
                            </div>
                        )}
                    </div>
                </div>
            );
            day = addDays(day, 1);
        }
        rows.push(
            <div className="grid grid-cols-7 w-full" key={day.toString()}>
                {days}
            </div>
        );
        days = [];
    }

    const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

    return (
        <div className="w-full border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80">
                {weekDays.map((d, i) => (
                    <div key={i} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {d}
                    </div>
                ))}
            </div>
            {/* Grid */}
            <div className="flex flex-col w-full">
                {rows}
            </div>
        </div>
    );
}
