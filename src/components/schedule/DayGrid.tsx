import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScheduleEvent } from "./ScheduleEvent";
import { saveCourses, type Course } from "@/lib/scheduleData";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DayGridProps {
    currentDate: Date;
    courses: Course[];
    onCourseUpdate?: (courses: Course[]) => void;
    onCourseClick?: (course: Course) => void;
}

const hours = [
    "08h00", "09h00", "10h00", "11h00", "12h00", "13h00", "14h00", "15h00", "16h00", "17h00", "18h00", "19h00"
];

const parseTime = (time: string) => {
    const match = time.match(/(\d+)h?(\d+)?/i);
    if (!match) return 8;
    let hour = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    return hour + (minutes / 60);
};

const ROW_HEIGHT = 70;

const getEventStyle = (startTime: string, endTime: string) => {
    const startHour = parseTime(startTime);
    const endHour = parseTime(endTime);
    const top = (startHour - 8) * ROW_HEIGHT;
    const height = (endHour - startHour) * ROW_HEIGHT;
    return { top: `${top}px`, height: `${height}px`, width: "calc(100% - 12px)" };
};

export function DayGrid({ currentDate, courses, onCourseUpdate, onCourseClick }: DayGridProps) {
    const today = new Date();
    const isToday = currentDate.toDateString() === today.toDateString();

    // Calculate dayIndex (0 = Monday, 6 = Sunday) to match mock data
    const dayIndex = currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1;

    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    const handleEventClick = (course: Course) => {
        if (onCourseUpdate) {
            setEditingCourse(course);
        } else if (onCourseClick) {
            onCourseClick(course);
        }
    };

    const handleDragStart = (e: React.DragEvent, courseId: string) => {
        if (!onCourseUpdate) return;
        e.dataTransfer.setData("courseId", courseId);
        e.currentTarget.classList.add("opacity-50");
    };

    const handleDragEnd = (e: React.DragEvent) => {
        e.currentTarget.classList.remove("opacity-50");
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const formatHourString = (hourNum: number) => {
        let displayHour = Math.floor(hourNum);
        const mins = hourNum % 1 !== 0 ? "h30" : "h00";
        return `${displayHour.toString().padStart(2, '0')}${mins}`;
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const courseId = e.dataTransfer.getData("courseId");
        if (!courseId || !onCourseUpdate) return;

        const columnRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const dropY = e.clientY - columnRect.top;

        const newStartHourRaw = (dropY / ROW_HEIGHT) + 8;
        const snappedStartHour = Math.max(8, Math.min(19.5, Math.round(newStartHourRaw * 2) / 2));

        const course = courses.find((c) => c.id === courseId);
        if (!course) return;

        const startHour = parseTime(course.startTime);
        const endHour = parseTime(course.endTime);
        const duration = endHour - startHour;

        const newEndHour = Math.min(20, snappedStartHour + duration);

        const updatedCourses = courses.map((c) =>
            c.id === courseId
                ? {
                    ...c,
                    date: format(currentDate, 'yyyy-MM-dd'),
                    startTime: formatHourString(snappedStartHour),
                    endTime: formatHourString(newEndHour),
                }
                : c
        );

        onCourseUpdate(updatedCourses);
        saveCourses(updatedCourses);
    };

    return (
        <div className="bg-white w-full">
            {/* Day header row */}
            <div className="grid grid-cols-[55px_1fr] border-b border-gray-100">
                <div></div>
                <div className="flex flex-col items-center justify-center py-3">
                    {isToday ? (
                        <div className="bg-[#1c2333] rounded-[18px] w-[50px] h-[60px] flex flex-col items-center justify-center shadow-lg">
                            <span className="text-[10px] font-medium text-white/70 capitalize mb-0.5">
                                {format(currentDate, 'EEEE', { locale: fr })}
                            </span>
                            <span className="text-lg font-bold text-white leading-none">
                                {currentDate.getDate()}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center w-[50px] h-[60px]">
                            <span className="text-[10px] font-medium text-gray-400 capitalize mb-0.5">
                                {format(currentDate, 'EEEE', { locale: fr })}
                            </span>
                            <span className="text-lg font-bold text-navy leading-none">
                                {currentDate.getDate()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Time grid */}
            <div className="grid grid-cols-[55px_1fr] relative">
                {/* Horizontal lines */}
                <div className="absolute left-[55px] right-0 top-0 bottom-0 pointer-events-none z-0">
                    {hours.map((_, i) => (
                        i > 0 && (
                            <div
                                key={i}
                                className="border-t border-gray-100 absolute w-full"
                                style={{ top: `${i * ROW_HEIGHT}px` }}
                            />
                        )
                    ))}
                </div>

                {/* Time labels column */}
                <div className="relative z-10 w-[55px]">
                    {hours.map((hour, idx) => (
                        idx > 0 && (
                            <div
                                key={hour}
                                className="absolute w-full flex items-start justify-center pr-4 text-[11px] text-gray-400 font-medium"
                                style={{ top: `${idx * ROW_HEIGHT}px`, marginTop: '-8px' }}
                            >
                                {hour}
                            </div>
                        )
                    ))}
                </div>

                {/* Day column */}
                <div className="relative z-10 min-h-[770px]">
                    {isToday && (
                        <div className="absolute top-0 bottom-0 left-1.5 right-1.5 bg-gray-50/70 rounded-3xl z-[-1]" />
                    )}

                    {/* Drop Zone overlay */}
                    {onCourseUpdate && (
                        <div
                            className="absolute inset-0 z-10"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        />
                    )}

                    {/* Events */}
                    {courses
                        .filter((course) => course.date === format(currentDate, 'yyyy-MM-dd'))
                        .map((course, i, arr) => {
                            const overlappingIndex = arr.findIndex(c => c.id !== course.id && c.startTime === course.startTime);
                            const isOverlapping = overlappingIndex !== -1;
                            const isSecond = isOverlapping && arr.indexOf(course) > overlappingIndex;
                            return (
                                <div
                                    key={course.id}
                                    className={cn(
                                        "absolute z-20 transition-all",
                                        (onCourseUpdate || onCourseClick) ? "cursor-pointer" : "cursor-default",
                                        isSecond ? "left-6" : "left-1.5"
                                    )}
                                    style={getEventStyle(course.startTime, course.endTime)}
                                    onClick={() => handleEventClick(course)}
                                    draggable={!!onCourseUpdate}
                                    onDragStart={(e) => handleDragStart(e, course.id)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <ScheduleEvent {...course} centerTitle={true} />
                                </div>
                            );
                        })}
                </div>

                {/* Current time indicator line */}
                {(() => {
                    const now = new Date();
                    const currentHourDecimal = now.getHours() + now.getMinutes() / 60;
                    if (isToday && currentHourDecimal >= 8 && currentHourDecimal <= 20) {
                        return (
                            <div
                                className="absolute left-[55px] right-0 h-[2px] bg-cyan-400 z-30 pointer-events-none"
                                style={{ top: `${(currentHourDecimal - 8) * ROW_HEIGHT}px` }}
                            >
                                <div className="absolute -left-1 -top-[3px] w-2 h-2 rounded-full bg-cyan-400"></div>
                            </div>
                        );
                    }
                    return null;
                })()}
            </div>
        </div>
    );
}
