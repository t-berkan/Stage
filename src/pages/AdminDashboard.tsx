import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Users, Trash2, Edit2, Search, GraduationCap, Calendar, Percent, Bell, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getCourses } from "@/lib/scheduleData";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { sendNotification } from "@/lib/studiesData";
import { format, isSameDay } from "date-fns";

const AdminDashboard = () => {
    const { toast } = useToast();
    const [users, setUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [todayCoursesCount, setTodayCoursesCount] = useState(0);

    // Form state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState("student");
    const [filiere, setFiliere] = useState("");

    // Notification state
    const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
    const [selectedUserForNotify, setSelectedUserForNotify] = useState<any>(null);
    const [notificationMessage, setNotificationMessage] = useState("");

    const handleOpenNotifyModal = (user: any) => {
        setSelectedUserForNotify(user);
        setNotificationMessage("");
        setIsNotifyModalOpen(true);
    };

    const handleSendNotification = () => {
        if (!selectedUserForNotify || !notificationMessage.trim()) return;

        const adminName = localStorage.getItem("userName") || "Administrateur";
        sendNotification(selectedUserForNotify.id, notificationMessage, "admin", adminName);

        toast({
            title: "Notification envoyée",
            description: `Message envoyé à ${selectedUserForNotify.firstName}.`,
        });

        setIsNotifyModalOpen(false);
        setNotificationMessage("");
    };

    // Load users on mount
    useEffect(() => {
        const storedUsers = localStorage.getItem("usersDb");
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        } else {
            // Initialize with admin and default teachers if empty
            const initialUsers = [
                { id: "admin-1", firstName: "Admin", lastName: "System", email: "admin@rsb.edu", password: "password123", role: "admin", filiere: "", createdAt: new Date().toISOString() },
                { id: "teacher-mgt", firstName: "Prof.", lastName: "Management", email: "mgt@rsb.edu", password: "password123", role: "teacher", filiere: "", createdAt: new Date().toISOString() },
                { id: "teacher-mkt", firstName: "Prof.", lastName: "Marketing", email: "mkt@rsb.edu", password: "password123", role: "teacher", filiere: "", createdAt: new Date().toISOString() },
                { id: "teacher-fin", firstName: "Prof.", lastName: "Finance", email: "fin@rsb.edu", password: "password123", role: "teacher", filiere: "", createdAt: new Date().toISOString() },
                { id: "teacher-acc", firstName: "Prof.", lastName: "Comptabilité", email: "acc@rsb.edu", password: "password123", role: "teacher", filiere: "", createdAt: new Date().toISOString() },
                { id: "teacher-eco", firstName: "Prof.", lastName: "Economie", email: "eco@rsb.edu", password: "password123", role: "teacher", filiere: "", createdAt: new Date().toISOString() },
                { id: "teacher-law", firstName: "Prof.", lastName: "Droit", email: "law@rsb.edu", password: "password123", role: "teacher", filiere: "", createdAt: new Date().toISOString() },
                { id: "teacher-data", firstName: "Prof.", lastName: "Data", email: "data@rsb.edu", password: "password123", role: "teacher", filiere: "", createdAt: new Date().toISOString() },
                { id: "teacher-int", firstName: "Prof.", lastName: "International", email: "int@rsb.edu", password: "password123", role: "teacher", filiere: "", createdAt: new Date().toISOString() },
                { id: "teacher-aut", firstName: "Prof.", lastName: "Autres", email: "aut@rsb.edu", password: "password123", role: "teacher", filiere: "", createdAt: new Date().toISOString() },
                { id: "student-1", firstName: "Eleve", lastName: "Test", email: "student@rsb.edu", password: "password123", role: "student", filiere: "Marketing", createdAt: new Date().toISOString() }
            ];
            localStorage.setItem("usersDb", JSON.stringify(initialUsers));
            setUsers(initialUsers);
        }

        const courses = getCourses();
        const today = new Date();
        setTodayCoursesCount(courses.filter(c => isSameDay(new Date(c.date), today) && !c.isCancelled).length);
    }, []);

    const handleEditClick = (user: any) => {
        setEditingId(user.id);
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);
        setPassword(user.password || "");
        setRole(user.role || "student");
        setFiliere(user.filiere || "");
    };

    const handleCreateOrUpdateUser = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!firstName || !lastName || !email || (!password && !editingId)) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Veuillez remplir tous les champs obligatoires.",
            });
            return;
        }

        if (editingId) {
            // Update existing user
            const updatedUsers = users.map(u => {
                if (u.id === editingId) {
                    return { ...u, firstName, lastName, email, role, filiere, password: password || u.password };
                }
                return u;
            });
            setUsers(updatedUsers);
            localStorage.setItem("usersDb", JSON.stringify(updatedUsers));

            toast({
                title: "Succès",
                description: `Le compte pour ${firstName} a été mis à jour.`,
            });

            setEditingId(null);
        } else {
            // Check if email already exists
            if (users.some(u => u.email === email)) {
                toast({
                    variant: "destructive",
                    title: "Erreur",
                    description: "Un utilisateur avec cet email existe déjà.",
                });
                return;
            }

            const newUser = {
                id: `student-${Date.now()}`,
                firstName,
                lastName,
                email,
                password, // In a real app, this would be hashed!
                role,
                filiere,
                createdAt: new Date().toISOString()
            };

            const updatedUsers = [...users, newUser];
            setUsers(updatedUsers);
            localStorage.setItem("usersDb", JSON.stringify(updatedUsers));

            toast({
                title: "Succès",
                description: `Le compte pour ${firstName} a été créé.`,
            });
        }

        // Reset form
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setRole("student");
        setFiliere("");
    };

    const handleDeleteUser = (id: string, userEmail: string) => {
        if (userEmail === "admin@rsb.edu") {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Vous ne pouvez pas supprimer le compte administrateur principal.",
            });
            return;
        }

        const updatedUsers = users.filter(u => u.id !== id);
        setUsers(updatedUsers);
        localStorage.setItem("usersDb", JSON.stringify(updatedUsers));

        toast({
            title: "Utilisateur supprimé",
            description: "Le compte a été supprimé avec succès.",
        });
    };

    const studentCount = users.filter(u => u.role === "student").length;
    const teacherCount = users.filter(u => u.role === "teacher").length;

    const filteredUsers = users.filter(u =>
        u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto py-8 lg:px-4 animate-fade-in h-full overflow-y-auto pr-2 pb-24 custom-scrollbar">

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-navy">Panneau d'Administration</h1>
                        <p className="text-gray-500 mt-1">Gérez les comptes étudiants et l'accès à la plateforme.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-pink/10 px-4 py-2 rounded-xl border border-pink/20">
                        <Users className="w-5 h-5 text-pink" />
                        <span className="font-semibold text-navy">{studentCount} Étudiant{studentCount !== 1 ? 's' : ''} inscrits</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="p-6 border-none shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-2xl bg-white flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-pink/10 flex items-center justify-center text-pink shrink-0">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Étudiants</p>
                            <h3 className="text-2xl font-bold text-navy">{studentCount}</h3>
                        </div>
                    </Card>
                    <Card className="p-6 border-none shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-2xl bg-white flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Profs Actifs</p>
                            <h3 className="text-2xl font-bold text-navy">{teacherCount}</h3>
                        </div>
                    </Card>
                    <Card className="p-6 border-none shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-2xl bg-white flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Cours Aujourd'hui</p>
                            <h3 className="text-2xl font-bold text-navy">{todayCoursesCount}</h3>
                        </div>
                    </Card>
                    <Card className="p-6 border-none shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-2xl bg-white flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                            <Percent className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Taux Occupation</p>
                            <h3 className="text-2xl font-bold text-navy">85%</h3>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add User Form */}
                    <Card className="p-6 border-none shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-2xl bg-white h-fit">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center text-navy shrink-0">
                                {editingId ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                            </div>
                            <h2 className="text-lg font-semibold text-navy">{editingId ? "Modifier un étudiant" : "Créer un étudiant"}</h2>
                        </div>

                        <form onSubmit={handleCreateOrUpdateUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-xs font-medium text-gray-600">Prénom</Label>
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Jean"
                                        className="bg-gray-50/50 border-gray-100 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-xs font-medium text-gray-600">Nom</Label>
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Dupont"
                                        className="bg-gray-50/50 border-gray-100 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-medium text-gray-600">Adresse Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="jean.dupont@rsb.edu"
                                    className="bg-gray-50/50 border-gray-100 rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2 relative">
                                    <Label htmlFor="password" className="text-xs font-medium text-gray-600">Mot de passe</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Mot de passe"
                                            className="bg-gray-50/50 border-gray-100 rounded-xl pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role" className="text-xs font-medium text-gray-600">Rôle</Label>
                                    <select
                                        id="role"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full h-10 px-3 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent"
                                        disabled={editingId !== null && email === "admin@rsb.edu"}
                                    >
                                        <option value="student">Étudiant</option>
                                        <option value="teacher">Professeur</option>
                                        <option value="admin">Administrateur</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="filiere" className="text-xs font-medium text-gray-600">Filière</Label>
                                    <select
                                        id="filiere"
                                        value={filiere}
                                        onChange={(e) => setFiliere(e.target.value)}
                                        className="w-full h-10 px-3 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent"
                                        disabled={role !== "student"}
                                    >
                                        <option value="">-- Aucune --</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Data">Data</option>
                                        <option value="Autres">Autres</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-2">
                                {editingId && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingId(null);
                                            setFirstName("");
                                            setLastName("");
                                            setEmail("");
                                            setPassword("");
                                            setRole("student");
                                            setFiliere("");
                                        }}
                                        className="w-full rounded-xl h-11"
                                    >
                                        Annuler
                                    </Button>
                                )}
                                <Button type="submit" className="w-full bg-navy hover:bg-navy-light text-white rounded-xl h-11">
                                    {editingId ? "Mettre à jour" : "Créer le compte"}
                                </Button>
                            </div>
                        </form>
                    </Card>

                    {/* Users List */}
                    <Card className="lg:col-span-2 p-6 border-none shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-2xl bg-white overflow-hidden flex flex-col h-[600px]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-lg font-semibold text-navy flex items-center gap-2 whitespace-nowrap">
                                Utilisateurs Enregistrés
                            </h2>
                            <div className="relative w-full sm:w-64 shrink-0">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <Input
                                    placeholder="Rechercher un utilisateur..."
                                    className="pl-9 bg-gray-50/50 border-gray-100 rounded-xl h-10 w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-auto flex-1 custom-scrollbar -mr-6 pr-6">
                            {filteredUsers.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <Users className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Aucun utilisateur trouvé.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 sticky top-0 z-10 rounded-lg">
                                        <tr>
                                            <th className="px-4 py-3 font-medium rounded-l-lg">Nom</th>
                                            <th className="px-4 py-3 font-medium">Email</th>
                                            <th className="px-4 py-3 font-medium">Rôle</th>
                                            <th className="px-4 py-3 font-medium">Filière</th>
                                            <th className="px-4 py-3 font-medium rounded-r-lg text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div className="font-medium text-navy">{user.firstName} {user.lastName}</div>
                                                </td>
                                                <td className="px-4 py-4 text-gray-600">{user.email}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin'
                                                        ? 'bg-navy/10 text-navy'
                                                        : user.role === 'teacher'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-gray-600 text-xs font-medium">
                                                    {user.filiere}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    {user.email !== "admin@rsb.edu" && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            {user.role === "student" && (
                                                                <button
                                                                    onClick={() => handleOpenNotifyModal(user)}
                                                                    className="p-2 text-gray-400 hover:text-pink hover:bg-pink/5 rounded-lg transition-colors"
                                                                    title="Envoyer une notification"
                                                                >
                                                                    <Bell className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleEditClick(user)}
                                                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Modifier l'utilisateur"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id, user.email)}
                                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Supprimer l'utilisateur"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </Card>
                </div>


                <Dialog open={isNotifyModalOpen} onOpenChange={setIsNotifyModalOpen}>
                    <DialogContent className="sm:max-w-[425px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-navy flex items-center gap-2">
                                <Bell className="w-5 h-5 text-pink" />
                                Notification pour {selectedUserForNotify?.firstName}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="message" className="text-sm font-medium text-gray-500">
                                    Message
                                </Label>
                                <Textarea
                                    id="message"
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
        </MainLayout>
    );
};

export default AdminDashboard;
