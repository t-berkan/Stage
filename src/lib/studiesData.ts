export interface Module {
    id: string;
    name: string;
    code: string;
    credits: number;
    professorId: string | null; // Links to a user with role "teacher"
    type: "Commun" | "Spécialisé";
    tagFiliere: string; // e.g. "Tronc Commun", "Marketing", "Finance", "Data", "Autres"
    totalCourses: number; // Total number of courses in the semester
    completedCourses: number; // Number of courses completed so far
}

export interface Resource {
    id: string;
    moduleId: string;
    title: string;
    type: "pdf" | "video" | "link";
    url: string;
}

export interface Evaluation {
    id: string;
    moduleId: string;
    title: string;
    dueDate: string;
    status: "to_do" | "pending" | "graded";
    urgent: boolean;
}

export interface Grade {
    id: string;
    studentId: string;
    moduleId: string;
    name: string;
    coef: number;
    score: number;
    comment: string;
    date: string;
}

export interface GlobalNotification {
    id: string;
    recipientId: string;
    message: string;
    time: string;
    isRead: boolean;
    senderRole: "admin" | "teacher" | "student";
    senderName?: string;
}

export const defaultModules: Module[] = [
    // Tronc Commun
    { id: "mod-tc-1", name: "Management", code: "MGT101", credits: 5, professorId: "teacher-mgt", type: "Commun", tagFiliere: "", totalCourses: 20, completedCourses: 12 },
    { id: "mod-tc-2", name: "Marketing de base", code: "MKT101", credits: 4, professorId: "teacher-mkt", type: "Commun", tagFiliere: "", totalCourses: 20, completedCourses: 12 },
    { id: "mod-tc-3", name: "Finance de base", code: "FIN101", credits: 4, professorId: "teacher-fin", type: "Commun", tagFiliere: "", totalCourses: 20, completedCourses: 12 },
    { id: "mod-tc-4", name: "Comptabilité", code: "ACC101", credits: 4, professorId: "teacher-acc", type: "Commun", tagFiliere: "", totalCourses: 20, completedCourses: 12 },
    { id: "mod-tc-5", name: "Économie", code: "ECO101", credits: 4, professorId: "teacher-eco", type: "Commun", tagFiliere: "", totalCourses: 20, completedCourses: 12 },
    { id: "mod-tc-6", name: "Droit des affaires", code: "LAW101", credits: 3, professorId: "teacher-law", type: "Commun", tagFiliere: "", totalCourses: 20, completedCourses: 12 },
    { id: "mod-tc-7", name: "Statistiques", code: "STA101", credits: 4, professorId: "teacher-data", type: "Commun", tagFiliere: "", totalCourses: 20, completedCourses: 12 },
    { id: "mod-tc-8", name: "Business international", code: "INT101", credits: 4, professorId: "teacher-int", type: "Commun", tagFiliere: "", totalCourses: 20, completedCourses: 12 },
    { id: "mod-tc-9", name: "Gestion de projet", code: "PRJ101", credits: 3, professorId: "teacher-mgt", type: "Commun", tagFiliere: "", totalCourses: 20, completedCourses: 12 },

    // Spécialités - Marketing
    { id: "mod-spe-mkt-1", name: "Marketing digital", code: "MKT201", credits: 6, professorId: "teacher-mkt", type: "Spécialisé", tagFiliere: "Marketing", totalCourses: 15, completedCourses: 5 },
    { id: "mod-spe-mkt-2", name: "Communication de marque", code: "MKT202", credits: 4, professorId: "teacher-mkt", type: "Spécialisé", tagFiliere: "Marketing", totalCourses: 15, completedCourses: 5 },
    { id: "mod-spe-mkt-3", name: "Consumer behavior", code: "MKT203", credits: 4, professorId: "teacher-mkt", type: "Spécialisé", tagFiliere: "Marketing", totalCourses: 15, completedCourses: 5 },

    // Spécialités - Finance
    { id: "mod-spe-fin-1", name: "Finance d’entreprise", code: "FIN201", credits: 6, professorId: "teacher-fin", type: "Spécialisé", tagFiliere: "Finance", totalCourses: 15, completedCourses: 5 },
    { id: "mod-spe-fin-2", name: "Marchés financiers", code: "FIN202", credits: 4, professorId: "teacher-fin", type: "Spécialisé", tagFiliere: "Finance", totalCourses: 15, completedCourses: 5 },
    { id: "mod-spe-fin-3", name: "Gestion de portefeuille", code: "FIN203", credits: 4, professorId: "teacher-fin", type: "Spécialisé", tagFiliere: "Finance", totalCourses: 15, completedCourses: 5 },

    // Spécialités - Data
    { id: "mod-spe-data-1", name: "Data analysis", code: "DAT201", credits: 6, professorId: "teacher-data", type: "Spécialisé", tagFiliere: "Data", totalCourses: 15, completedCourses: 5 },
    { id: "mod-spe-data-2", name: "Statistiques avancées", code: "DAT202", credits: 4, professorId: "teacher-data", type: "Spécialisé", tagFiliere: "Data", totalCourses: 15, completedCourses: 5 },
    { id: "mod-spe-data-3", name: "Data visualization", code: "DAT203", credits: 4, professorId: "teacher-data", type: "Spécialisé", tagFiliere: "Data", totalCourses: 15, completedCourses: 5 },

    // Spécialités - Supply Chain
    { id: "mod-spe-sc-1", name: "Gestion des opérations", code: "SCM201", credits: 6, professorId: "teacher-mgt", type: "Spécialisé", tagFiliere: "Supply Chain", totalCourses: 15, completedCourses: 5 },
    { id: "mod-spe-sc-2", name: "Logistique internationale", code: "SCM202", credits: 4, professorId: "teacher-int", type: "Spécialisé", tagFiliere: "Supply Chain", totalCourses: 15, completedCourses: 5 },

    // Spécialités - Entrepreneuriat
    { id: "mod-spe-ent-1", name: "Design thinking", code: "ENT201", credits: 6, professorId: "teacher-mgt", type: "Spécialisé", tagFiliere: "Entrepreneuriat", totalCourses: 15, completedCourses: 5 },
    { id: "mod-spe-ent-2", name: "Innovation & création d’entreprise", code: "ENT202", credits: 4, professorId: "teacher-mgt", type: "Spécialisé", tagFiliere: "Entrepreneuriat", totalCourses: 15, completedCourses: 5 },

    // Spécialités - Cyber / Risk
    { id: "mod-spe-cyber-1", name: "Sécurité informatique", code: "RISK201", credits: 6, professorId: "teacher-data", type: "Spécialisé", tagFiliere: "Cyber", totalCourses: 15, completedCourses: 5 },
    { id: "mod-spe-cyber-2", name: "Gestion des risques", code: "RISK202", credits: 4, professorId: "teacher-law", type: "Spécialisé", tagFiliere: "Cyber", totalCourses: 15, completedCourses: 5 },
];

export const defaultGrades: Grade[] = [];

export const defaultEvaluations: Evaluation[] = [];

// --- Modules ---
export const getModules = (): Module[] => {
    const stored = localStorage.getItem("modulesDb_v6");
    if (stored) {
        return JSON.parse(stored);
    }
    localStorage.setItem("modulesDb_v6", JSON.stringify(defaultModules));
    return defaultModules;
};

export const saveModules = (modules: Module[]) => {
    localStorage.setItem("modulesDb_v6", JSON.stringify(modules));
};

export const addModule = (module: Omit<Module, "id">) => {
    const modules = getModules();
    const newModule = { ...module, id: `mod-${Date.now()}` };
    modules.push(newModule);
    saveModules(modules);
    return newModule;
};

export const updateModule = (id: string, data: Partial<Module>) => {
    const modules = getModules();
    const updated = modules.map((m) => (m.id === id ? { ...m, ...data } : m));
    saveModules(updated);
};

export const deleteModule = (id: string) => {
    const modules = getModules();
    saveModules(modules.filter((m) => m.id !== id));
};

// --- Grades ---
export const getGrades = (): Grade[] => {
    const stored = localStorage.getItem("gradesDb");
    if (stored) return JSON.parse(stored);
    localStorage.setItem("gradesDb", JSON.stringify(defaultGrades));
    return defaultGrades;
};

export const saveGrades = (grades: Grade[]) => {
    localStorage.setItem("gradesDb", JSON.stringify(grades));
};

export const getStudentGrades = (studentId: string): Grade[] => {
    return getGrades().filter(g => g.studentId === studentId);
};

export const getModuleGrades = (moduleId: string): Grade[] => {
    return getGrades().filter(g => g.moduleId === moduleId);
};

export const addGrade = (grade: Omit<Grade, "id" | "date">) => {
    const grades = getGrades();
    const newGrade = {
        ...grade,
        id: `grade-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        date: new Date().toISOString()
    };
    grades.push(newGrade);
    saveGrades(grades);
    return newGrade;
};

export const updateGrade = (id: string, data: Partial<Grade>) => {
    const grades = getGrades();
    const updated = grades.map((g) => (g.id === id ? { ...g, ...data } : g));
    saveGrades(updated);
};

export const deleteGrade = (id: string) => {
    const grades = getGrades();
    saveGrades(grades.filter((g) => g.id !== id));
};

// --- Users Helper ---
export const getStudents = () => {
    const users = JSON.parse(localStorage.getItem("usersDb") || "[]");
    return users.filter((u: any) => u.role === "student");
};

export const getTeachers = () => {
    const users = JSON.parse(localStorage.getItem("usersDb") || "[]");
    return users.filter((u: any) => u.role === "teacher");
};

// --- Evaluations ---
export const getEvaluations = (): Evaluation[] => {
    const stored = localStorage.getItem("evaluationsDb");
    if (stored) {
        let parsed = JSON.parse(stored);

        // One-time cleanup to remove old mock evaluations without deleting user's real evaluations
        if (!localStorage.getItem("evaluationsDb_cleaned")) {
            parsed = parsed.filter((e: Evaluation) => !["eval-mkt-1", "eval-mkt-2", "eval-fin-1"].includes(e.id));
            localStorage.setItem("evaluationsDb", JSON.stringify(parsed));
            localStorage.setItem("evaluationsDb_cleaned", "true");
        }

        return parsed;
    }
    localStorage.setItem("evaluationsDb", JSON.stringify(defaultEvaluations));
    return defaultEvaluations;
};

export const saveEvaluations = (evaluations: Evaluation[]) => {
    localStorage.setItem("evaluationsDb", JSON.stringify(evaluations));
};

export const getModuleEvaluations = (moduleId: string): Evaluation[] => {
    return getEvaluations().filter(e => e.moduleId === moduleId);
};

export const addEvaluation = (evaluation: Omit<Evaluation, "id">) => {
    const evaluations = getEvaluations();
    const newEvaluation = {
        ...evaluation,
        id: `eval-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };
    evaluations.push(newEvaluation as Evaluation);
    saveEvaluations(evaluations);
    return newEvaluation;
};

export const updateEvaluation = (id: string, data: Partial<Evaluation>) => {
    const evaluations = getEvaluations();
    const updated = evaluations.map((e) => (e.id === id ? { ...e, ...data } : e));
    saveEvaluations(updated as Evaluation[]);
};

export const deleteEvaluation = (id: string) => {
    const evaluations = getEvaluations();
    saveEvaluations(evaluations.filter((e) => e.id !== id));
};

// --- Notifications ---
export const getNotifications = (userId: string): GlobalNotification[] => {
    const key = `notifications_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    return [];
};

export const sendNotification = (recipientId: string, message: string, senderRole: "admin" | "teacher" | "student", senderName?: string) => {
    const key = `notifications_${recipientId}`;
    const existing = getNotifications(recipientId);

    const newNotification: GlobalNotification = {
        id: Math.random().toString(36).substr(2, 9),
        recipientId,
        message,
        time: "À l'instant",
        isRead: false,
        senderRole,
        senderName
    };

    const updated = [newNotification, ...existing];
    localStorage.setItem(key, JSON.stringify(updated));

    // Trigger a set of events for consistency
    window.dispatchEvent(new Event("notificationsUpdated"));
    window.dispatchEvent(new Event("storage"));
};

export const markNotificationAsRead = (userId: string, notificationId: string) => {
    const key = `notifications_${userId}`;
    const existing = getNotifications(userId);
    const updated = existing.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new Event("notificationsUpdated"));
};

export const markAllNotificationsAsRead = (userId: string) => {
    const key = `notifications_${userId}`;
    const existing = getNotifications(userId);
    const updated = existing.map(n => ({ ...n, isRead: true }));
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new Event("notificationsUpdated"));
};
export interface Submission {
    id: string;
    evaluationId: string;
    studentId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    submittedAt: string;
    status: "pending" | "graded";
    fileData?: string; // Base64 or DataURL
    comment?: string;
}

// --- Submissions ---
export const getSubmissions = (): Submission[] => {
    const stored = localStorage.getItem("submissionsDb");
    if (stored) return JSON.parse(stored);
    return [];
};

export const saveSubmissions = (submissions: Submission[]) => {
    try {
        localStorage.setItem("submissionsDb", JSON.stringify(submissions));
        return true;
    } catch (e) {
        console.error("LocalStorage limit reached", e);
        return false;
    }
};

export const addSubmission = (submission: Omit<Submission, "id" | "submittedAt">) => {
    const submissions = getSubmissions();
    const newSubmission: Submission = {
        ...submission,
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        submittedAt: new Date().toISOString()
    };

    // Replace existing submission if the student already submitted for this evaluation
    const existingIndex = submissions.findIndex(
        s => s.evaluationId === submission.evaluationId && s.studentId === submission.studentId
    );

    if (existingIndex !== -1) {
        submissions[existingIndex] = newSubmission;
    } else {
        submissions.push(newSubmission);
    }

    const success = saveSubmissions(submissions);
    return success ? newSubmission : null;
};

export const clearSubmissions = () => {
    localStorage.removeItem("submissionsDb");
};

export const deleteSubmission = (evaluationId: string, studentId: string) => {
    const submissions = getSubmissions();
    const filtered = submissions.filter(
        s => !(s.evaluationId === evaluationId && s.studentId === studentId)
    );
    saveSubmissions(filtered);
};

export const getEvaluationSubmissions = (evaluationId: string): Submission[] => {
    return getSubmissions().filter(s => s.evaluationId === evaluationId);
};

export const getStudentSubmissions = (studentId: string): Submission[] => {
    return getSubmissions().filter(s => s.studentId === studentId);
};
