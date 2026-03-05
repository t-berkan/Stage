import { CourseCard } from "./CourseCard";

import { getModules } from "@/lib/studiesData";
import { getCourses, Course } from "@/lib/scheduleData";
import { useEffect, useState } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

const parseTime = (time: string) => {
  const match = time.match(/(\d+)h?(\d+)?/i);
  if (!match) return 8;
  let hour = parseInt(match[1]);
  const minutes = match[2] ? parseInt(match[2]) : 0;
  return hour + (minutes / 60);
};

const formatDuration = (start: string, end: string) => {
  const s = parseTime(start);
  const e = parseTime(end);
  const duration = e - s;
  return `${duration}h.`;
};

export function NextCourses() {
  const [todayCourses, setTodayCourses] = useState<any[]>([]);
  const [tomorrowCourses, setTomorrowCourses] = useState<any[]>([]);

  useEffect(() => {
    const allCourses = getCourses();
    const userFiliere = localStorage.getItem("userFiliere") || "";
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId") || "";
    const today = new Date();
    const tomorrow = addDays(today, 1);

    // Fetch modules to determine teacher's subjects using the centralized helper
    const allModules = getModules();
    const teacherModuleIds = allModules.filter((m: any) => m.professorId === userId).map((m: any) => m.id);

    const filteredCourses = allCourses.filter(c => {
      if (c.isCancelled) return false;
      if (userRole === "student") {
        return (!c.tagFiliere) || (c.tagFiliere === userFiliere);
      } else if (userRole === "teacher") {
        return teacherModuleIds.includes(c.moduleId);
      }
      return true; // admin sees all
    });

    const getFormattedCourse = (c: Course, d: Date) => ({
      day: format(d, "EEE", { locale: fr }),
      dayNumber: d.getDate(),
      title: c.title,
      duration: formatDuration(c.startTime, c.endTime),
      building: c.building,
      room: c.room,
      startTime: c.startTime,
      endTime: c.endTime,
    });

    const parsedToday = filteredCourses
      .filter(c => isSameDay(new Date(c.date), today))
      .sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime))
      .map(c => getFormattedCourse(c, today));

    const parsedTomorrow = filteredCourses
      .filter(c => isSameDay(new Date(c.date), tomorrow))
      .sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime))
      .map(c => getFormattedCourse(c, tomorrow));

    setTodayCourses(parsedToday);
    setTomorrowCourses(parsedTomorrow);
  }, []);

  return (
    <div className="space-y-1 h-full flex flex-col">
      <h2 className="text-lg font-bold text-navy mb-2">Next course</h2>

      <div className="bg-[#F8F9FB] rounded-[25px] pt-4 px-3 pb-3 flex-1 flex flex-col overflow-y-auto">
        <div className="space-y-2">
          {todayCourses.length > 0 ? (
            todayCourses.map((course, index) => (
              <CourseCard key={`today-${index}`} {...course} />
            ))
          ) : (
            <p className="text-sm text-center text-gray-500 py-2">Aucun cours aujourd'hui.</p>
          )}
        </div>

        <div className="text-center py-0.5 mt-2 mb-2">
          <span className="text-[11px] font-medium text-gray-400">Demain</span>
        </div>

        <div className="space-y-2">
          {tomorrowCourses.length > 0 ? (
            tomorrowCourses.map((course, index) => (
              <CourseCard key={`tomorrow-${index}`} {...course} variant="green" />
            ))
          ) : (
            <p className="text-sm text-center text-gray-500 py-2">Aucun cours demain.</p>
          )}
        </div>
      </div>
    </div>
  );
}