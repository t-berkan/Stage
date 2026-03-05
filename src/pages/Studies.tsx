import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Plus, Pencil, Trash2, FileText, Video, Link as LinkIcon, Download, AlertCircle, CheckCircle2, BookOpen, Upload, Users, ChevronLeft, Bell, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Module, Grade, Evaluation, Submission,
  getModules, saveModules, addModule, updateModule, deleteModule,
  getGrades, getStudentGrades, getModuleGrades, addGrade, updateGrade, deleteGrade,
  getStudents, getTeachers,
  getEvaluations, addEvaluation, updateEvaluation, deleteEvaluation,
  getSubmissions, addSubmission, getEvaluationSubmissions, clearSubmissions, deleteSubmission,
  sendNotification
} from "@/lib/studiesData";
import { getCourses, type Course } from "@/lib/scheduleData";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

// Add mock resources strictly for UI demonstration
const globalMockResources = [
  { id: "r1", title: "Chapitre 1 - Introduction", type: "pdf", url: "#" },
  { id: "r2", title: "TD 1 - Exercices corrigés", type: "pdf", url: "#" },
  { id: "r3", title: "Replay du Cours", type: "video", url: "#" },
];

export default function Studies() {
  const userRole = localStorage.getItem("userRole") || "student";
  const userId = localStorage.getItem("userId") || "";

  const isAdmin = userRole === "admin";
  const isTeacher = userRole === "teacher";
  const isStudent = userRole === "student";

  // Data State
  const [modules, setModules] = useState<Module[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const currentUser = { id: userId, role: userRole };

  // Navigation State (Teacher & Student)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [studentSelectedModule, setStudentSelectedModule] = useState<Module | null>(null);

  // Modal State (Admin)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [form, setForm] = useState<Partial<Module>>({});

  // Modal State (Teacher - Grades)
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [gradeForm, setGradeForm] = useState<Partial<Grade>>({});

  // Modal State (Teacher - Evaluations)
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [editingEval, setEditingEval] = useState<Evaluation | null>(null);
  const [evalForm, setEvalForm] = useState<Partial<Evaluation>>({});

  // Modal State (Teacher - Submissions View)
  const [selectedEvalForSubmissions, setSelectedEvalForSubmissions] = useState<Evaluation | null>(null);
  const [evalSubmissions, setEvalSubmissions] = useState<Submission[]>([]);
  const { toast } = useToast();

  // Notification state
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [selectedStudentForNotify, setSelectedStudentForNotify] = useState<any>(null);
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    // Load initial data
    setModules(getModules());
    setStudents(getStudents());
    setAllTeachers(getTeachers());
    setCourses(getCourses());
    setEvaluations(getEvaluations());
    setSubmissions(getSubmissions());

    if (isStudent) {
      setGrades(getStudentGrades(userId));
    } else if (isTeacher) {
      // Load all grades, we will filter by module later
      setGrades(getGrades());
    }
  }, [userId, isStudent, isTeacher]);

  const teacherModules = modules.filter(m => m.professorId === userId);

  // --- Admin Methods ---
  const handleOpenModal = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setForm(module);
    } else {
      setEditingModule(null);
      setForm({ name: "", code: "", credits: 3, professorId: "" });
    }
    setIsModalOpen(true);
  };

  const handleSaveModule = () => {
    if (!form.name || !form.code) return;

    if (editingModule) {
      updateModule(editingModule.id, form);
    } else {
      addModule(form as Omit<Module, "id">);
    }
    setModules(getModules());
    setIsModalOpen(false);
  };

  const handleDeleteModule = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) {
      deleteModule(id);
      setModules(getModules());
    }
  };

  // --- Teacher Methods ---
  const handleOpenGradeModal = (studentId: string, grade?: Grade) => {
    if (grade) {
      setEditingGrade(grade);
      setGradeForm(grade);
    } else {
      setEditingGrade(null);
      setGradeForm({ studentId, moduleId: selectedModule?.id, name: "", coef: 1, score: 10, comment: "" });
    }
    setIsGradeModalOpen(true);
  };

  const handleSaveGrade = () => {
    if (!gradeForm.name || gradeForm.score === undefined || gradeForm.coef === undefined) return;

    if (editingGrade) {
      updateGrade(editingGrade.id, gradeForm);
    } else {
      addGrade(gradeForm as Omit<Grade, "id" | "date">);
    }
    setGrades(getGrades());
    setIsGradeModalOpen(false);
  };

  const handleDeleteGrade = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) {
      deleteGrade(id);
      setGrades(getGrades());
    }
  };

  const handleOpenEvalModal = (evaluation?: Evaluation) => {
    if (evaluation) {
      setEditingEval(evaluation);
      setEvalForm(evaluation);
    } else {
      setEditingEval(null);
      setEvalForm({ moduleId: selectedModule?.id, title: "", dueDate: "", status: "to_do", urgent: false });
    }
    setIsEvalModalOpen(true);
  };

  const handleSaveEval = () => {
    if (!evalForm.title || !evalForm.dueDate) return;

    if (editingEval) {
      updateEvaluation(editingEval.id, evalForm);
    } else {
      addEvaluation(evalForm as Omit<Evaluation, "id">);
    }
    setEvaluations(getEvaluations());
    setIsEvalModalOpen(false);
  };

  const handleDeleteEval = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce devoir ?")) {
      deleteEvaluation(id);
      setEvaluations(getEvaluations());
    }
  };

  const handleOpenNotifyModal = (student: any) => {
    setSelectedStudentForNotify(student);
    setNotificationMessage("");
    setIsNotifyModalOpen(true);
  };

  const handleSendNotification = () => {
    if (!selectedStudentForNotify || !notificationMessage.trim()) return;

    const teacherName = localStorage.getItem("userName") || "Professeur";
    sendNotification(selectedStudentForNotify.id, notificationMessage, "teacher", teacherName);

    toast({
      title: "Notification envoyée",
      description: `Message envoyé à ${selectedStudentForNotify.firstName}.`,
    });

    setIsNotifyModalOpen(false);
    setNotificationMessage("");
  };

  const handleDownloadSubmission = (sub: Submission) => {
    if (sub.fileData) {
      // Real download from stored data
      const link = document.createElement('a');
      link.href = sub.fileData;
      link.download = sub.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Téléchargement réussi",
        description: `Le fichier ${sub.fileName} a été téléchargé.`,
      });
    } else {
      // Fallback only if content is missing (e.g. from an old submission or storage failure)
      const content = `ERREUR : Le contenu réel du fichier "${sub.fileName}" n'a pas pu être récupéré.\n\nCeci arrive si :\n1. Le fichier a été déposé avant la mise à jour du système.\n2. L'espace de stockage du navigateur était plein au moment du dépôt.\n\nAction : Veuillez demander à l'élève de supprimer son dépôt (icône corbeille) et de re-déposer le fichier.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `A-REFAIRE-${sub.fileName}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Fichier incomplet",
        description: "Ce dépôt ne contient que des métadonnées. Un re-dépôt est nécessaire.",
        variant: "destructive"
      });
    }
  };


  // --- Render Admin View ---
  const renderAdminView = () => (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                <TableHead className="font-semibold text-navy">Code</TableHead>
                <TableHead className="font-semibold text-navy">Matière</TableHead>
                <TableHead className="font-semibold text-navy">Crédits (ECTS)</TableHead>
                <TableHead className="font-semibold text-navy">Professeur Assigné</TableHead>
                <TableHead className="text-right font-semibold text-navy">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => {
                const prof = allTeachers.find(t => t.id === module.professorId);
                return (
                  <TableRow key={module.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-medium text-navy">
                      <Badge variant="outline" className="text-xs bg-gray-50">
                        {module.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{module.name}</TableCell>
                    <TableCell className="text-gray-600">{module.credits}</TableCell>
                    <TableCell>
                      {prof ? (
                        <span className="text-gray-600">{prof.firstName} {prof.lastName}</span>
                      ) : (
                        <span className="text-gray-400 italic">Non assigné</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal(module)}
                          className="text-gray-400 hover:text-navy hover:bg-gray-100 h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteModule(module.id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingModule ? "Modifier le module" : "Ajouter un module"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">Code</Label>
              <Input
                id="code"
                value={form.code || ""}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="col-span-3"
                placeholder="Ex: MAT101"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Matière</Label>
              <Input
                id="name"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="col-span-3"
                placeholder="Ex: Mathématiques"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="credits" className="text-right">Crédits</Label>
              <Input
                id="credits"
                type="number"
                value={form.credits || ""}
                onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="professorId" className="text-right">Professeur</Label>
              <select
                id="professorId"
                value={form.professorId || ""}
                onChange={(e) => setForm({ ...form, professorId: e.target.value })}
                className="col-span-3 h-10 px-3 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent"
              >
                <option value="">-- Sélectionner un professeur --</option>
                {allTeachers.map(t => (
                  <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveModule} className="bg-navy hover:bg-navy-light text-white">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  // --- Render Teacher View ---
  const renderTeacherView = () => {
    if (!selectedModule) {
      return (
        <div className="space-y-6">
          <p className="text-gray-500">Sélectionnez une de vos matières pour gérer les notes des étudiants.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherModules.map((module) => (
              <div
                key={module.id}
                onClick={() => setSelectedModule(module)}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
              >
                <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${module.type === "Spécialisé" ? 'bg-purple-500 group-hover:bg-purple-400' : 'bg-pink group-hover:bg-pink-light'}`}></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-gray-50">{module.code}</Badge>
                    <h3 className="font-semibold text-xl text-navy leading-tight">{module.name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500 mt-4">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">
                    {(() => {
                      const enrolledStudents = students.filter(s =>
                        !module.tagFiliere || module.tagFiliere === "" || s.filiere === module.tagFiliere
                      );
                      return `${enrolledStudents.length} Élève${enrolledStudents.length !== 1 ? 's' : ''} inscrit${enrolledStudents.length !== 1 ? 's' : ''}`;
                    })()}
                  </span>
                </div>
              </div>
            ))}
            {teacherModules.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                Vous n'avez aucune matière assignée.
              </div>
            )}
          </div>
        </div>
      );
    }

    // Module Detail View (Teacher)
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="pl-0 gap-2 text-gray-500 hover:text-navy" onClick={() => setSelectedModule(null)}>
            <ChevronLeft className="w-4 h-4" />
            Retour aux matières
          </Button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-navy">{selectedModule.name}</h2>
            <p className="text-gray-500 mt-1">Gérez les notes et évaluations des élèves de cette classe.</p>
          </div>
          <Badge className="bg-pink text-white">{selectedModule.code}</Badge>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold text-navy">Étudiant</TableHead>
                <TableHead className="font-semibold text-navy">Email</TableHead>
                <TableHead className="font-semibold text-navy">Liste des Notes</TableHead>
                <TableHead className="font-semibold text-navy text-center w-[150px]">Moyenne (/20)</TableHead>
                <TableHead className="text-right font-semibold text-navy">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students
                .filter(s => !selectedModule.tagFiliere || selectedModule.tagFiliere === "" || s.filiere === selectedModule.tagFiliere)
                .map(student => {
                  const studentGrades = grades.filter(g => g.studentId === student.id && g.moduleId === selectedModule.id);

                  // Calculate average
                  let average = 0;
                  if (studentGrades.length > 0) {
                    const totalCoef = studentGrades.reduce((acc, g) => Number(acc) + Number(g.coef), 0);
                    const totalScore = studentGrades.reduce((acc, g) => acc + (g.score * g.coef), 0);
                    average = totalScore / totalCoef;
                  }

                  return (
                    <TableRow key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <TableCell className="font-medium text-navy">{student.firstName} {student.lastName}</TableCell>
                      <TableCell className="text-gray-500 text-sm">{student.email}</TableCell>
                      <TableCell>
                        {studentGrades.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">Aucune note</span>
                        ) : (
                          <div className="flex gap-2 flex-wrap">
                            {studentGrades.map(g => (
                              <Badge
                                key={g.id}
                                variant="outline"
                                className="text-xs flex gap-1 cursor-pointer bg-white hover:bg-gray-50 transition-colors border-gray-200"
                                onClick={() => handleOpenGradeModal(student.id, g)}
                              >
                                <span className="font-medium text-navy">{g.name} :</span>
                                <span className={g.score >= 10 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{g.score}</span>
                                <span className="text-gray-400 ml-1">(x{g.coef})</span>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {studentGrades.length > 0 ? (
                          <span className={`font-bold text-lg ${average >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                            {average.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenNotifyModal(student)}
                            className="text-gray-400 hover:text-pink hover:bg-pink/5 p-2 h-8 w-8 rounded-lg"
                            title="Envoyer une notification"
                          >
                            <Bell className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenGradeModal(student.id)}
                            className="text-pink hover:text-pink-light hover:bg-pink/5 gap-1 shrink-0 px-2"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Nouvelle Note
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>

        {/* Grade Modal */}
        <Dialog open={isGradeModalOpen} onOpenChange={setIsGradeModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingGrade ? "Modifier la note" : "Ajouter une note"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gradeName" className="text-right">Nom Exam</Label>
                <Input
                  id="gradeName"
                  value={gradeForm.name || ""}
                  onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Ex: Partiel Mi-Semestre"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gradeScore" className="text-right">Note (/20)</Label>
                <Input
                  id="gradeScore"
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  value={gradeForm.score ?? ""}
                  onChange={(e) => setGradeForm({ ...gradeForm, score: parseFloat(e.target.value) })}
                  className="col-span-3"
                  placeholder="Ex: 15.5"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gradeCoef" className="text-right">Coéfficient</Label>
                <Input
                  id="gradeCoef"
                  type="number"
                  step="0.5"
                  min="0"
                  value={gradeForm.coef ?? 1}
                  onChange={(e) => setGradeForm({ ...gradeForm, coef: parseFloat(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="gradeComment" className="text-right pt-2">Commentaire</Label>
                <textarea
                  id="gradeComment"
                  value={gradeForm.comment || ""}
                  onChange={(e) => setGradeForm({ ...gradeForm, comment: e.target.value })}
                  className="col-span-3 h-20 min-h-[80px] px-3 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent resize-none"
                  placeholder="Appréciation globale (facultatif)..."
                />
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center sm:justify-between">
              {editingGrade ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleDeleteGrade(editingGrade.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              ) : <div></div>}
              <Button onClick={handleSaveGrade} className="bg-navy hover:bg-navy-light text-white">
                Enregistrer la note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mt-12">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
            <h3 className="text-xl font-semibold text-navy">Devoirs & Évaluations</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (window.confirm("Voulez-vous supprimer TOUS les fichiers déposés et vider le stockage ?")) {
                    clearSubmissions();
                    setEvaluations(getEvaluations());
                    toast({ title: "Stockage vidé", description: "Tous les anciens rendus ont été supprimés." });
                  }
                }}
                className="text-gray-500 hover:text-red-500 hover:bg-red-50 border-gray-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Vider le stockage
              </Button>
              <Button size="sm" onClick={() => handleOpenEvalModal()} className="bg-navy hover:bg-navy-light text-white gap-2">
                <Plus className="w-4 h-4" />
                Nouveau Devoir
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {evaluations.filter(e => e.moduleId === selectedModule.id).map(evaluation => (
              <div key={evaluation.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 flex-shrink-0 ${evaluation.urgent ? 'text-red-500' : 'text-amber-500'}`}>
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-navy text-base">{evaluation.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm font-medium ${evaluation.urgent ? 'text-red-500 bg-red-50 px-2 py-0.5 rounded-full' : 'text-gray-500'}`}>
                        À rendre : {evaluation.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      setSelectedEvalForSubmissions(evaluation);
                      setEvalSubmissions(getEvaluationSubmissions(evaluation.id));
                    }}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Voir les rendus ({getEvaluationSubmissions(evaluation.id).length})
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEvalModal(evaluation)} className="text-gray-400 hover:text-navy hover:bg-gray-100 h-8 w-8">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteEval(evaluation.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {evaluations.filter(e => e.moduleId === selectedModule.id).length === 0 && (
              <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                Aucun devoir planifié pour ce module.
              </div>
            )}
          </div>
        </div>

        {/* Submissions List Modal for Teachers */}
        <Dialog open={!!selectedEvalForSubmissions} onOpenChange={(open) => !open && setSelectedEvalForSubmissions(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
            <DialogHeader className="p-8 border-b border-gray-50 bg-white">
              <DialogTitle className="text-2xl font-bold text-navy flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-pink" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Rendus des travaux</p>
                  {selectedEvalForSubmissions?.title}
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-50 hover:bg-transparent">
                    <TableHead className="font-semibold text-navy">Étudiant</TableHead>
                    <TableHead className="font-semibold text-navy">Fichier</TableHead>
                    <TableHead className="font-semibold text-navy">Date de dépôt</TableHead>
                    <TableHead className="text-right font-semibold text-navy">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evalSubmissions.map((sub) => {
                    const student = students.find(s => s.id === sub.studentId);
                    return (
                      <TableRow key={sub.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-bold text-navy">
                          {student ? `${student.firstName} ${student.lastName}` : "Étudiant Inconnu"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-navy truncate max-w-[200px]">{sub.fileName}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{(sub.fileSize / 1024).toFixed(0)} KB • {sub.fileType.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm font-medium">
                          {format(new Date(sub.submittedAt), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-4 gap-2 border-pink text-pink hover:bg-pink hover:text-white rounded-xl transition-all shadow-sm"
                            onClick={() => handleDownloadSubmission(sub)}
                          >
                            <Download className="w-4 h-4" />
                            Télécharger
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {evalSubmissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20">
                        <div className="flex flex-col items-center gap-3">
                          <Upload className="w-12 h-12 text-gray-200" />
                          <p className="text-gray-400 font-medium">Aucun fichier déposé pour le moment.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <DialogFooter className="p-6 border-t border-gray-50 bg-gray-50/30">
              <Button onClick={() => setSelectedEvalForSubmissions(null)} className="px-8 bg-navy hover:bg-navy-light text-white rounded-xl shadow-md">
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Evaluation Modal */}
        <Dialog open={isEvalModalOpen} onOpenChange={setIsEvalModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingEval ? "Modifier le devoir" : "Ajouter un devoir"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="evalTitle" className="text-right">Titre</Label>
                <Input
                  id="evalTitle"
                  value={evalForm.title || ""}
                  onChange={(e) => setEvalForm({ ...evalForm, title: e.target.value })}
                  className="col-span-3"
                  placeholder="Ex: Projet de mi-semestre"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="evalDate" className="text-right">Date de rendu</Label>
                <Input
                  id="evalDate"
                  type="date"
                  value={evalForm.dueDate || ""}
                  onChange={(e) => setEvalForm({ ...evalForm, dueDate: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-start-2 col-span-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="evalUrgent"
                    className="w-4 h-4 text-pink rounded border-gray-300 focus:ring-pink"
                    checked={evalForm.urgent || false}
                    onChange={(e) => setEvalForm({ ...evalForm, urgent: e.target.checked })}
                  />
                  <Label htmlFor="evalUrgent" className="font-normal">Marquer comme urgent</Label>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center sm:justify-between">
              {editingEval ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleDeleteEval(editingEval.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              ) : <div></div>}
              <Button onClick={handleSaveEval} className="bg-navy hover:bg-navy-light text-white">
                Enregistrer le devoir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Notification Modal */}
        <Dialog open={isNotifyModalOpen} onOpenChange={setIsNotifyModalOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-navy flex items-center gap-2">
                <Bell className="w-5 h-5 text-pink" />
                Notification pour {selectedStudentForNotify?.firstName}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="message-notif" className="text-sm font-medium text-gray-500">
                  Message
                </Label>
                <Textarea
                  id="message-notif"
                  placeholder="Écrivez votre message ici..."
                  className="min-h-[120px] bg-gray-50/50 border-gray-100 rounded-xl focus:ring-pink"
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsNotifyModalOpen(false)}
                className="rounded-xl"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSendNotification}
                className="bg-navy hover:bg-navy-light text-white rounded-xl"
                disabled={!notificationMessage.trim()}
              >
                Envoyer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // --- Render Student View ---
  const renderStudentView = () => {
    const userFiliere = localStorage.getItem("userFiliere") || "";
    const studentModules = modules.filter(m =>
      (!m.tagFiliere) || // Generic common modules
      (m.tagFiliere === userFiliere) // Modules matching student's specialty
    );

    const troncCommunModules = studentModules.filter(m => m.type === "Commun" && !m.tagFiliere);
    const speModules = studentModules.filter(m => m.tagFiliere === userFiliere);

    const renderModuleSection = (mods: Module[], title: string, showFiliereBadge: boolean = false) => {
      if (mods.length === 0) return null;
      return (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-2">
            <h2 className="text-xl font-semibold text-navy">{title}</h2>
            {showFiliereBadge && (
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none font-semibold">
                {userFiliere}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mods.map((module) => {
              const prof = allTeachers.find(t => t.id === module.professorId);
              const myGrades = grades.filter(g => g.moduleId === module.id);

              // Calculate average for badge
              let average = null;
              if (myGrades.length > 0) {
                const totalCoef = myGrades.reduce((acc, g) => Number(acc) + Number(g.coef), 0);
                const totalScore = myGrades.reduce((acc, g) => acc + (g.score * g.coef), 0);
                average = (totalScore / totalCoef).toFixed(1);
              }

              // Calculate progress percentage dynamically
              const moduleCourses = courses.filter(c => c.moduleId === module.id);
              const todayStr = format(new Date(), 'yyyy-MM-dd');
              const pastCoursesCount = moduleCourses.filter(c => c.date < todayStr).length;
              const totalScheduled = module.totalCourses || moduleCourses.length;

              const progressRaw = totalScheduled > 0 ? (pastCoursesCount / totalScheduled) * 100 : 0;
              const progress = Math.min(100, Math.max(0, Math.round(progressRaw)));

              return (
                <div
                  key={module.id}
                  onClick={() => setStudentSelectedModule(module)}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${showFiliereBadge ? 'bg-purple-500 group-hover:bg-purple-400' : 'bg-pink group-hover:bg-pink-light'}`}></div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-navy leading-tight">{module.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{prof ? `${prof.firstName} ${prof.lastName}` : "Non assigné"}</p>
                    </div>
                    {average !== null && (
                      <Badge variant="secondary" className="bg-gray-100 text-navy font-semibold text-xs border-none">
                        {average}/20
                      </Badge>
                    )}
                  </div>

                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                      <span>Progression du semestre ({pastCoursesCount}/{totalScheduled})</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className={`h-2 bg-gray-100`} indicatorClassName={showFiliereBadge ? "bg-purple-500" : "bg-pink"} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      );
    };

    return (
      <div className="space-y-12 pb-12">
        {renderModuleSection(troncCommunModules, "Tronc Commun")}
        {renderModuleSection(speModules, "Ma Spécialisation", true)}

        <section>
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
            <h2 className="text-xl font-semibold text-navy">Relevé de Notes</h2>
            {grades.length > 0 && (
              <div className="bg-navy/5 px-4 py-1 rounded-full border border-navy/10">
                <span className="text-sm font-bold text-navy">
                  Moyenne Générale : {(() => {
                    const totalCoef = grades.reduce((acc, g) => Number(acc) + Number(g.coef), 0);
                    const totalScore = grades.reduce((acc, g) => acc + (g.score * g.coef), 0);
                    const avg = totalCoef > 0 ? (totalScore / totalCoef) : 0;
                    return (
                      <span className={avg >= 10 ? 'text-green-600' : 'text-red-500'}>
                        {avg.toFixed(2)}
                      </span>
                    );
                  })()}/20
                </span>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {studentModules.map(module => {
              const moduleGrades = grades.filter(g => g.moduleId === module.id);
              if (moduleGrades.length === 0) return null;

              const moduleTotalCoef = moduleGrades.reduce((acc, g) => Number(acc) + Number(g.coef), 0);
              const moduleTotalScore = moduleGrades.reduce((acc, g) => acc + (g.score * g.coef), 0);
              const moduleAvg = (moduleTotalScore / moduleTotalCoef).toFixed(2);

              return (
                <div key={`report-${module.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-navy">{module.name}</h3>
                    <Badge variant="secondary" className="bg-white text-navy font-bold border-gray-200">
                      Moyenne : {moduleAvg}/20
                    </Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-gray-50">
                          <TableHead className="font-semibold text-gray-500 text-xs uppercase pl-6">Examen</TableHead>
                          <TableHead className="font-semibold text-gray-500 text-xs uppercase text-center w-24">Coef.</TableHead>
                          <TableHead className="font-semibold text-gray-500 text-xs uppercase text-center w-24">Note</TableHead>
                          <TableHead className="font-semibold text-gray-500 text-xs uppercase pr-6">Commentaire</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {moduleGrades.map((grade) => (
                          <TableRow key={grade.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                            <TableCell className="font-medium text-navy pl-6">{grade.name}</TableCell>
                            <TableCell className="text-center text-gray-600 font-medium">{grade.coef}</TableCell>
                            <TableCell className={`text-center font-bold ${grade.score >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                              {grade.score}
                            </TableCell>
                            <TableCell className="text-gray-500 italic text-sm pr-6">
                              {grade.comment || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}

            {grades.length === 0 && (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 py-12 text-center text-gray-400">
                <Percent className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Vous n'avez pas encore de notes enregistrées.</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy mb-4 border-b border-gray-100 pb-2">Évaluations & Devoirs</h2>
          <div className="space-y-3">
            {evaluations
              .filter(e => studentModules.some(m => m.id === e.moduleId))
              .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
              .map((evaluation) => {
                const isPast = new Date(evaluation.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
                let studentStatus: Evaluation['status'] = evaluation.status;
                if (studentStatus === 'to_do' && isPast) {
                  studentStatus = 'graded'; // Simplify past due date logic for UI
                }
                const module = modules.find(m => m.id === evaluation.moduleId);

                return (
                  <div key={evaluation.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 flex-shrink-0 ${studentStatus === 'graded' ? 'text-green-500' : evaluation.urgent ? 'text-red-500' : 'text-amber-500'}`}>
                        {studentStatus === 'graded' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy text-base">{evaluation.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-sm font-medium ${evaluation.urgent && studentStatus !== 'graded' ? 'text-red-500 bg-red-50 px-2 py-0.5 rounded-full' : 'text-gray-500'}`}>
                            À rendre : {evaluation.dueDate}
                          </span>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{module?.name || "Module Inconnu"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-gray-100">
                      <Badge
                        variant="secondary"
                        className={`font-semibold shrink-0 cursor-default ${studentStatus === 'to_do' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                          studentStatus === 'pending' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                            'bg-green-100 text-green-700 hover:bg-green-100'
                          }`}
                      >
                        {studentStatus === 'to_do' ? 'À faire' : studentStatus === 'pending' ? 'En attente' : 'Terminé'}
                      </Badge>

                      {studentStatus === 'to_do' && (
                        <div className="relative overflow-hidden group">
                          <Button size="sm" className="bg-white border-2 border-dashed border-gray-300 text-gray-600 group-hover:border-pink group-hover:text-pink group-hover:bg-pink-50 transition-colors relative z-10 w-32">
                            <Upload className="w-4 h-4 mr-2" />
                            Déposer
                          </Button>
                          <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const fileData = event.target?.result as string;

                                  // 1. Add submission record
                                  const result = addSubmission({
                                    evaluationId: evaluation.id,
                                    studentId: currentUser?.id || "anonymous",
                                    fileName: file.name,
                                    fileType: file.type || "application/octet-stream",
                                    fileSize: file.size,
                                    status: "pending",
                                    fileData: fileData // store the full content
                                  });

                                  if (result) {
                                    // 2. Update evaluation status globally
                                    updateEvaluation(evaluation.id, { status: "pending" });

                                    // 3. Notify professor
                                    const module = modules.find(m => m.id === evaluation.moduleId);
                                    if (module?.professorId) {
                                      const studentName = localStorage.getItem("userName") || "Un étudiant";
                                      sendNotification(
                                        module.professorId,
                                        `${studentName} a déposé un nouveau fichier pour : ${evaluation.title}`,
                                        "student",
                                        studentName
                                      );
                                    }

                                    // 4. Notify student
                                    toast({
                                      title: "Fichier déposé avec succès",
                                      description: `Le fichier "${file.name}" a été enregistré et transmis.`,
                                    });
                                    // 4. Refresh data
                                    setEvaluations(getEvaluations());
                                  } else {
                                    toast({
                                      title: "Erreur de capacité",
                                      description: "Le fichier est trop volumineux pour le stockage local du navigateur (limite ~5Mo).",
                                      variant: "destructive"
                                    });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </div>
                      )}
                      {studentStatus !== 'to_do' && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-32 py-1.5 border-gray-200 text-gray-500 justify-center">
                            {studentStatus === 'pending' ? 'En attente' : 'Corrigé'}
                          </Badge>
                          {studentStatus === 'pending' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8"
                              onClick={() => {
                                if (window.confirm("Supprimer votre dépôt pour recommencer ?")) {
                                  deleteSubmission(evaluation.id, currentUser?.id || "anonymous");
                                  updateEvaluation(evaluation.id, { status: "to_do" });
                                  setEvaluations(getEvaluations());
                                  toast({ title: "Dépôt supprimé", description: "Vous pouvez maintenant redéposer un fichier." });
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            {evaluations.filter(e => studentModules.some(m => m.id === e.moduleId)).length === 0 && (
              <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                Aucun devoir à faire pour le moment.
              </div>
            )}
          </div>
        </section>

        {/* Student Module Detail Modal (with Resources) */}
        <Dialog
          open={!!studentSelectedModule}
          onOpenChange={(open) => !open && setStudentSelectedModule(null)}
        >
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
            {studentSelectedModule && (() => {
              const isSpecialization = studentSelectedModule.tagFiliere && studentSelectedModule.tagFiliere !== "";
              const accentColorClass = isSpecialization ? "purple" : "pink";
              const accentBgClass = isSpecialization ? "bg-purple-500" : "bg-pink";
              const accentTextClass = isSpecialization ? "text-purple-500" : "text-pink";
              const accentLightBgClass = isSpecialization ? "bg-purple-50" : "bg-pink/5";

              return (
                <>
                  <div className="bg-white p-8 border-b border-gray-100 relative">
                    <Badge className={`${accentBgClass} text-white mb-3 border-none`}>
                      {studentSelectedModule.code}
                    </Badge>
                    <h2 className="text-3xl font-bold leading-tight text-navy">{studentSelectedModule.name}</h2>
                    <p className="text-gray-500 mt-2 font-medium">
                      Professeur : {(() => {
                        const prof = allTeachers.find(t => t.id === studentSelectedModule.professorId);
                        return prof ? `${prof.firstName} ${prof.lastName}` : "Non assigné";
                      })()}
                    </p>
                    <div className={`absolute top-0 right-0 w-32 h-32 ${isSpecialization ? 'bg-purple-500/5' : 'bg-pink/5'} rounded-bl-full -z-0`}></div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                    <h3 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
                      <BookOpen className={`w-5 h-5 ${accentTextClass}`} />
                      Ressources & Supports
                    </h3>

                    <div className="space-y-4">
                      {globalMockResources.map((resource) => (
                        <div key={resource.id} className={`flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all group cursor-pointer border border-gray-100/50 hover:border-${accentColorClass}/20`}>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 
                          ${resource.type === 'pdf' ? 'bg-red-50 text-red-500' :
                              resource.type === 'video' ? 'bg-blue-50 text-blue-500' :
                                'bg-green-50 text-green-500'}`}
                          >
                            {resource.type === 'pdf' && <FileText className="w-6 h-6" />}
                            {resource.type === 'video' && <Video className="w-6 h-6" />}
                            {resource.type === 'link' && <LinkIcon className="w-6 h-6" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-navy truncate group-hover:text-${accentColorClass} transition-colors`}>{resource.title}</p>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-0.5">{resource.type}</p>
                          </div>
                          <Button variant="ghost" size="icon" className={`h-10 w-10 text-gray-400 group-hover:${accentTextClass} group-hover:${accentLightBgClass} rounded-full transition-all`}>
                            {resource.type === 'link' ? <LinkIcon className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Quick Stats / Info */}
                    <div className="mt-10 grid grid-cols-2 gap-4">
                      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] mb-1">Crédits ECTS</p>
                        <p className="text-2xl font-semibold text-navy tracking-tight">{studentSelectedModule.credits}</p>
                      </div>
                      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] mb-1">Type de Module</p>
                        <p className="text-2xl font-semibold text-navy tracking-tight">{studentSelectedModule.type === 'Commun' ? 'Tronc Co.' : 'Spécialité'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white border-t border-gray-50 flex justify-end">
                    <Button onClick={() => setStudentSelectedModule(null)} className="px-8 bg-navy hover:bg-navy-light text-white rounded-xl">
                      Fermer
                    </Button>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="pb-8 animate-fade-in pr-4 custom-scrollbar overflow-y-auto flex-1 h-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-navy">
            {isAdmin ? "Gestion des Modules" : isTeacher ? "Espace Enseignant" : "Espace Études"}
          </h1>
          {isAdmin && (
            <Button onClick={() => handleOpenModal()} className="bg-navy hover:bg-navy-light text-white gap-2">
              <Plus className="w-4 h-4" />
              Ajouter un module
            </Button>
          )}
        </div>

        {isAdmin && renderAdminView()}
        {isTeacher && renderTeacherView()}
        {isStudent && renderStudentView()}
      </div>
    </MainLayout>
  );
}