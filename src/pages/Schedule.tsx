import { useState, useEffect } from "react";
import { format } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";
import { ScheduleHeader } from "@/components/schedule/ScheduleHeader";
import { WeekGrid } from "@/components/schedule/WeekGrid";
import { DayGrid } from "@/components/schedule/DayGrid";
import { MonthGrid } from "@/components/schedule/MonthGrid";
import { getCourses, type Course } from "@/lib/scheduleData";
import { getModules, getTeachers } from "@/lib/studiesData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Users, MapPin, Clock, Calendar as CalendarIcon } from "lucide-react";
import { saveCourses } from "@/lib/scheduleData";

const Schedule = () => {
  const userRole = localStorage.getItem("userRole");
  const userFiliere = localStorage.getItem("userFiliere") || "";
  const canEditSchedule = userRole === "admin" || userRole === "teacher";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState<Partial<Course>>({
    title: "",
    building: "",
    room: "",
    startTime: "9:00 AM",
    endTime: "10:30 AM",
    dayIndex: 0,
    type: "Commun",
    tagFiliere: "",
  });

  const [selectedDetailCourse, setSelectedDetailCourse] = useState<Course | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    setCourses(getCourses());
  }, []);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleCourseClick = (course: Course) => {
    setSelectedDetailCourse(course);
    setIsDetailModalOpen(true);
  };

  const getProfessorName = (moduleId: string) => {
    const modules = getModules();
    const teachers = getTeachers();
    const module = modules.find(m => m.id === moduleId);
    if (module && module.professorId) {
      const teacher = teachers.find(t => t.id === module.professorId);
      if (teacher) return `${teacher.firstName} ${teacher.lastName}`;
    }
    return "Non assigné";
  };

  let filteredCourses = selectedRoom === "all" ? courses : courses.filter(c => c.room === selectedRoom);
  const userId = localStorage.getItem("userId") || "";

  if (userRole === "student") {
    filteredCourses = filteredCourses.filter(c =>
      (!c.tagFiliere) || (c.tagFiliere === userFiliere)
    );
  } else if (userRole === "teacher") {
    const modules = getModules();
    const teacherModuleIds = modules.filter(m => m.professorId === userId).map(m => m.id);
    filteredCourses = filteredCourses.filter(c => teacherModuleIds.includes(c.moduleId));
  }

  // Get unique rooms for the filter dropdown
  const uniqueRooms = Array.from(new Set(courses.map(c => c.room)));

  const handleAddCourse = () => {
    if (!newCourseForm.title || !newCourseForm.room || !newCourseForm.startTime) return;

    const newCourse: Course = {
      id: Math.random().toString(36).substr(2, 9),
      title: newCourseForm.title || "",
      building: newCourseForm.building || "",
      room: newCourseForm.room || "",
      startTime: newCourseForm.startTime || "9:00 AM",
      endTime: newCourseForm.endTime || "10:30 AM",
      dayIndex: newCourseForm.dayIndex ?? 0,
      type: newCourseForm.type || "Commun",
      tagFiliere: newCourseForm.tagFiliere || "",
      date: format(currentDate, 'yyyy-MM-dd'),
      moduleId: "", // Manual courses don't have a moduleId by default
    };

    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    saveCourses(updatedCourses);
    setIsAddModalOpen(false);

    // Reset form
    setNewCourseForm({
      title: "",
      building: "",
      room: "",
      startTime: "9:00 AM",
      endTime: "10:30 AM",
      dayIndex: 0,
      type: "Commun",
      tagFiliere: "",
    });
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full animate-fade-in pr-2 pb-4 custom-scrollbar overflow-y-auto">
        <ScheduleHeader
          currentDate={currentDate}
          view={view}
          onViewChange={setView}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={handleToday}
          onDateSelect={setCurrentDate}
        />

        {canEditSchedule && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0 mb-4 w-full">
            <h2 className="text-lg font-semibold text-navy">Filtres Admin</h2>
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger className="w-[140px] md:w-[200px] bg-white border-gray-200">
                  <SelectValue placeholder="Salles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les salles</SelectItem>
                  {uniqueRooms.map(room => (
                    <SelectItem key={room} value={room}>{room}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setIsAddModalOpen(true)} className="bg-navy hover:bg-navy-light text-white gap-1 md:gap-2 px-3 md:px-4 flex-1 md:flex-none">
                <Plus className="w-4 h-4 shrink-0" />
                <span className="text-xs md:text-sm">Ajouter un cours</span>
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="min-w-[800px] pb-4">
            {view === "day" && (
              <DayGrid currentDate={currentDate} courses={filteredCourses} onCourseUpdate={canEditSchedule ? setCourses : undefined} onCourseClick={handleCourseClick} />
            )}
            {view === "week" && (
              <WeekGrid currentDate={currentDate} courses={filteredCourses} onCourseUpdate={canEditSchedule ? setCourses : undefined} onCourseClick={handleCourseClick} />
            )}
            {view === "month" && (
              <MonthGrid currentDate={currentDate} courses={filteredCourses} onCourseUpdate={canEditSchedule ? setCourses : undefined} onCourseClick={handleCourseClick} />
            )}
          </div>
        </div>

        {/* Add Course Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau cours</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Titre du cours</Label>
                <Input
                  value={newCourseForm.title || ""}
                  onChange={e => setNewCourseForm({ ...newCourseForm, title: e.target.value })}
                  placeholder="Ex: Mathématiques"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Salle</Label>
                  <Select
                    value={newCourseForm.room || ""}
                    onValueChange={val => setNewCourseForm({ ...newCourseForm, room: val })}
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
                    value={newCourseForm.building || ""}
                    onChange={e => setNewCourseForm({ ...newCourseForm, building: e.target.value })}
                    placeholder="Ex: Bât B"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Heure de début</Label>
                  <Input
                    value={newCourseForm.startTime || ""}
                    onChange={e => setNewCourseForm({ ...newCourseForm, startTime: e.target.value })}
                    placeholder="Ex: 9:00 AM"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heure de fin</Label>
                  <Input
                    value={newCourseForm.endTime || ""}
                    onChange={e => setNewCourseForm({ ...newCourseForm, endTime: e.target.value })}
                    placeholder="Ex: 10:30 AM"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newCourseForm.type || "Commun"}
                    onValueChange={val => setNewCourseForm({ ...newCourseForm, type: val as "Commun" | "Spécialisé" })}
                  >
                    <SelectTrigger className="w-full bg-white border-gray-200">
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Commun">Tronc Commun</SelectItem>
                      <SelectItem value="Spécialisé">Spécialisé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Filière</Label>
                  <Select
                    value={newCourseForm.tagFiliere || "none"}
                    onValueChange={val => setNewCourseForm({ ...newCourseForm, tagFiliere: val === "none" ? "" : val })}
                    disabled={newCourseForm.type === "Commun"}
                  >
                    <SelectTrigger className="w-full bg-white border-gray-200">
                      <SelectValue placeholder="Sélectionnez une filière" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Aucune --</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Data">Data</SelectItem>
                      <SelectItem value="Autres">Autres</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Jour de la semaine</Label>
                <Select
                  value={newCourseForm.dayIndex?.toString() ?? "0"}
                  onValueChange={val => setNewCourseForm({ ...newCourseForm, dayIndex: parseInt(val) })}
                >
                  <SelectTrigger className="w-full bg-white border-gray-200">
                    <SelectValue placeholder="Sélectionnez un jour" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Lundi</SelectItem>
                    <SelectItem value="1">Mardi</SelectItem>
                    <SelectItem value="2">Mercredi</SelectItem>
                    <SelectItem value="3">Jeudi</SelectItem>
                    <SelectItem value="4">Vendredi</SelectItem>
                    <SelectItem value="5">Samedi</SelectItem>
                    <SelectItem value="6">Dimanche</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleAddCourse} className="w-full bg-navy hover:bg-navy-light text-white">
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Course Detail Modal (Read-only for all) */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedDetailCourse?.type === "Spécialisé" ? "bg-purple-50 text-purple-500" : "bg-teal/10 text-teal"}`}>
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-navy">{selectedDetailCourse?.title}</DialogTitle>
                  <p className="text-xs font-medium text-gray-400 tracking-wider uppercase">{selectedDetailCourse?.type === "Spécialisé" ? `Spécialisation ${selectedDetailCourse?.tagFiliere}` : "Tronc Commun"}</p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Professeur</p>
                    <p className="text-sm font-semibold text-navy">
                      {selectedDetailCourse ? getProfessorName(selectedDetailCourse.moduleId) : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Lieu</p>
                    <p className="text-sm font-semibold text-navy">{selectedDetailCourse?.room}</p>
                    <p className="text-xs text-gray-500">{selectedDetailCourse?.building}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-teal/10 transition-colors"></div>
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-teal" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Horaire & Date</p>
                  <p className="text-base font-bold flex items-center gap-2 text-navy">
                    {selectedDetailCourse?.startTime} - {selectedDetailCourse?.endTime}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">{selectedDetailCourse?.date}</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setIsDetailModalOpen(false)} className="w-full bg-teal hover:opacity-90 text-white rounded-xl h-12 font-bold shadow-lg shadow-teal/20 transition-all active:scale-95">
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Schedule;