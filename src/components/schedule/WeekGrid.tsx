import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScheduleEvent } from "./ScheduleEvent";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveCourses, type Course } from "@/lib/scheduleData";
import { Trash2 } from "lucide-react";
import { format, isSameDay } from "date-fns";

interface WeekGridProps {
  currentDate: Date;
  courses: Course[];
  onCourseUpdate?: (courses: Course[]) => void;
  onCourseClick?: (course: Course) => void;
}

const hours = [
  "08h00", "09h00", "10h00", "11h00", "12h00", "13h00", "14h00", "15h00", "16h00", "17h00", "18h00", "19h00"
];

const getDaysOfWeek = (date: Date) => {
  const days = [];
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay() + 1);

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
};

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
  return { top: `${top}px`, height: `${height}px` };
};

export function WeekGrid({ currentDate, courses, onCourseUpdate, onCourseClick }: WeekGridProps) {
  const days = getDaysOfWeek(currentDate);
  const today = new Date();

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editForm, setEditForm] = useState<Partial<Course>>({});

  const handleDragStart = (e: React.DragEvent, courseId: string) => {
    if (!onCourseUpdate) return;
    e.dataTransfer.setData("courseId", courseId);
    e.currentTarget.classList.add("opacity-50");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-50");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const formatHourString = (hourNum: number) => {
    let displayHour = Math.floor(hourNum);
    const mins = hourNum % 1 !== 0 ? "h30" : "h00";
    return `${displayHour.toString().padStart(2, '0')}${mins}`;
  };

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const courseId = e.dataTransfer.getData("courseId");
    if (!courseId || !onCourseUpdate) return;

    const columnRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dropY = e.clientY - columnRect.top;

    // Calculate new start time based on Y position (snapping to 30 mins)
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
          date: dateStr,
          startTime: formatHourString(snappedStartHour),
          endTime: formatHourString(newEndHour),
        }
        : c
    );

    onCourseUpdate(updatedCourses);
    saveCourses(updatedCourses);
  };

  const handleEventClick = (course: Course) => {
    if (onCourseUpdate) {
      setEditingCourse(course);
      setEditForm(course);
    } else if (onCourseClick) {
      onCourseClick(course);
    }
  };

  const handleSaveEdit = () => {
    if (!editingCourse || !onCourseUpdate) return;
    const updatedCourses = courses.map(c => c.id === editingCourse.id ? { ...c, ...editForm } as Course : c);
    onCourseUpdate(updatedCourses);
    saveCourses(updatedCourses);
    setEditingCourse(null);
  };

  const handleCancelCourse = () => {
    if (!editingCourse || !onCourseUpdate) return;
    const updatedCourses = courses.map(c =>
      c.id === editingCourse.id ? { ...c, isCancelled: !c.isCancelled } : c
    );
    onCourseUpdate(updatedCourses);
    saveCourses(updatedCourses);
    setEditingCourse(null);
  };

  const handleDeleteCourse = () => {
    if (!editingCourse || !onCourseUpdate) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce cours ?")) return;

    const updatedCourses = courses.filter(c => c.id !== editingCourse.id);
    onCourseUpdate(updatedCourses);
    saveCourses(updatedCourses);
    setEditingCourse(null);
  };

  return (
    <div className="bg-white w-full">
      {/* Day headers row */}
      <div className="grid grid-cols-[55px_repeat(7,1fr)] border-b border-gray-100">
        <div></div>
        {days.map((day, index) => {
          const isToday = day.toDateString() === today.toDateString();
          return (
            <div
              key={index}
              className="flex flex-col items-center justify-center py-3"
            >
              {isToday ? (
                <div className="bg-[#1c2333] rounded-[18px] w-[50px] h-[60px] flex flex-col items-center justify-center shadow-lg">
                  <span className="text-[10px] font-medium text-white/70 capitalize mb-0.5">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className="text-lg font-bold text-white leading-none">
                    {day.getDate()}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-[50px] h-[60px]">
                  <span className="text-[10px] font-medium text-gray-400 capitalize mb-0.5">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className="text-lg font-bold text-navy leading-none">
                    {day.getDate()}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[55px_repeat(7,1fr)] relative">
        {/* Horizontal lines - absolute, full width */}
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

        {/* Day columns */}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isToday = isSameDay(day, today);
          return (
            <div
              key={dateStr}
              className="relative z-10"
            >
              {/* Today background highlight */}
              {isToday && (
                <div className="absolute top-0 bottom-0 left-1.5 right-1.5 bg-gray-50/70 rounded-3xl z-[-1]" />
              )}

              {/* Drop Zone overlay */}
              {onCourseUpdate && (
                <div
                  className="absolute inset-0 z-10"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, dateStr)}
                />
              )}

              {/* Height spacers */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{ height: `${ROW_HEIGHT}px` }}
                />
              ))}

              {/* Events */}
              {courses
                .filter((course) => course.date === dateStr)
                .map((course, i, arr) => {
                  const sameTimeCourses = arr.filter(c => c.startTime === course.startTime);
                  const overlapCount = sameTimeCourses.length;
                  const overlapIndex = sameTimeCourses.findIndex(c => c.id === course.id);

                  // Check if course is in the past
                  const courseDate = new Date(course.date);
                  const isPastDate = courseDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  let isPast = isPastDate;
                  if (isSameDay(courseDate, today)) {
                    const endHour = parseTime(course.endTime);
                    const currentHourDecimal = today.getHours() + today.getMinutes() / 60;
                    if (endHour <= currentHourDecimal) {
                      isPast = true;
                    }
                  }

                  return (
                    <div
                      key={course.id}
                      className={cn(
                        "absolute z-20 transition-all",
                        (onCourseUpdate || onCourseClick) ? "cursor-pointer" : "cursor-default",
                        isPast ? "opacity-[0.65]" : ""
                      )}
                      style={{
                        ...getEventStyle(course.startTime, course.endTime),
                        left: overlapCount > 1 ? `calc(${(100 / overlapCount) * overlapIndex}% + ${overlapIndex === 0 ? 6 : 2}px)` : "6px",
                        width: overlapCount > 1 ? `calc(${100 / overlapCount}% - 8px)` : "calc(100% - 12px)",
                      }}
                      onClick={() => handleEventClick(course)}
                      draggable={!!onCourseUpdate}
                      onDragStart={(e) => handleDragStart(e, course.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <ScheduleEvent {...course} centerTitle={overlapCount > 1} />
                    </div>
                  );
                })}
            </div>
          );
        })}

        {/* Current time indicator line */}
        {(() => {
          const isCurrentWeek = days.some(d => isSameDay(d, today));
          if (!isCurrentWeek) return null;

          const currentHourDecimal = today.getHours() + today.getMinutes() / 60;
          if (currentHourDecimal >= 8 && currentHourDecimal <= 20) {
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

      {/* Edit Course Modal */}
      <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le cours</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Titre du cours</Label>
              <Input
                value={editForm.title || ""}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Salle</Label>
                <Select
                  value={editForm.room || ""}
                  onValueChange={val => setEditForm({ ...editForm, room: val })}
                >
                  <SelectTrigger className="w-full bg-white border-gray-200">
                    <SelectValue placeholder="Sélectionnez une salle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Salle 1">Salle 1</SelectItem>
                    <SelectItem value="Salle 2">Salle 2</SelectItem>
                    <SelectItem value="Salle 3">Salle 3</SelectItem>
                    <SelectItem value="Salle 4">Salle 4</SelectItem>
                    <SelectItem value="Salle 10">Salle 10</SelectItem>
                    <SelectItem value="Salle 11">Salle 11</SelectItem>
                    <SelectItem value="Salle 12">Salle 12</SelectItem>
                    <SelectItem value="Salle 13">Salle 13</SelectItem>
                    <SelectItem value="Salle 14">Salle 14</SelectItem>
                    <SelectItem value="Salle 15">Salle 15</SelectItem>
                    <SelectItem value="Salle Informatique 1">Salle Informatique 1</SelectItem>
                    <SelectItem value="Salle Informatique 2">Salle Informatique 2</SelectItem>
                    <SelectItem value="Amphi A">Amphi A</SelectItem>
                    <SelectItem value="Amphi B">Amphi B</SelectItem>
                    <SelectItem value="Amphi C">Amphi C</SelectItem>
                    <SelectItem value="Amphi D">Amphi D</SelectItem>
                    <SelectItem value="Labo 1">Labo 1</SelectItem>
                    <SelectItem value="Labo 2">Labo 2</SelectItem>
                    <SelectItem value="Labo Astro">Labo Astro</SelectItem>
                    <SelectItem value="Atelier Design">Atelier Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bâtiment</Label>
                <Input
                  value={editForm.building || ""}
                  onChange={e => setEditForm({ ...editForm, building: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heure de début</Label>
                <Input
                  value={editForm.startTime || ""}
                  onChange={e => setEditForm({ ...editForm, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Heure de fin</Label>
                <Input
                  value={editForm.endTime || ""}
                  onChange={e => setEditForm({ ...editForm, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date du cours</Label>
              <Input
                type="date"
                value={editForm.date || ""}
                onChange={e => setEditForm({ ...editForm, date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 justify-between">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleDeleteCourse}
                title="Supprimer définitivement"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={editingCourse?.isCancelled ? "outline" : "secondary"}
                onClick={handleCancelCourse}
                className="w-full sm:w-auto"
              >
                {editingCourse?.isCancelled ? "Rétablir le cours" : "Annuler le cours"}
              </Button>
            </div>
            <Button type="button" onClick={handleSaveEdit} className="w-full sm:w-auto bg-navy hover:bg-navy-light shrink-0">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}