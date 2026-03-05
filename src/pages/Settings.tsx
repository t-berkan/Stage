import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Bell, Shield, Paintbrush, LogOut, ChevronRight, Upload, Moon, Sun, Eye, EyeOff } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
const Settings = () => {
    const [activeTab, setActiveTab] = useState("compte");
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("Étudiant");
    const [userEmail, setUserEmail] = useState<string>("etudiant@rsb.edu");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const storedAvatar = localStorage.getItem("userAvatar");
        if (storedAvatar) {
            setUserAvatar(storedAvatar);
        }

        const storedName = localStorage.getItem("userName");
        if (storedName) setUserName(storedName);

        const storedEmail = localStorage.getItem("userEmail");
        if (storedEmail) setUserEmail(storedEmail);

        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "dark") {
            setIsDarkMode(true);
        }
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_SIZE = 200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

                    const base64String = canvas.toDataURL("image/jpeg", 0.7);

                    try {
                        setUserAvatar(base64String);
                        localStorage.setItem("userAvatar", base64String);
                        window.dispatchEvent(new Event("avatarUpdated"));
                    } catch (err) {
                        console.error("Failed to save avatar", err);
                        alert("L'image est trop volumineuse pour être sauvegardée.");
                    }
                };
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleTheme = (mode: "light" | "dark") => {
        setIsDarkMode(mode === "dark");
        if (mode === "dark") {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    const handleSaveProfile = () => {
        localStorage.setItem("userName", userName);
        localStorage.setItem("userEmail", userEmail);
        window.dispatchEvent(new Event("profileUpdated"));
        toast({ title: "Succès", description: "Vos préférences ont été enregistrées avec succès." });
    };

    const handleChangePassword = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast({ variant: "destructive", title: "Erreur", description: "Veuillez remplir tous les champs." });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({ variant: "destructive", title: "Erreur", description: "Les nouveaux mots de passe ne correspondent pas." });
            return;
        }

        const userId = localStorage.getItem("userId");
        if (!userId) {
            toast({ variant: "destructive", title: "Erreur", description: "Utilisateur introuvable. Veuillez vous reconnecter." });
            return;
        }

        const storedUsers = localStorage.getItem("usersDb");
        if (storedUsers) {
            const users = JSON.parse(storedUsers);
            const userIndex = users.findIndex((u: any) => u.id === userId);

            if (userIndex !== -1) {
                if (users[userIndex].password !== currentPassword) {
                    toast({ variant: "destructive", title: "Erreur", description: "Le mot de passe actuel est incorrect." });
                    return;
                }

                users[userIndex].password = newPassword;
                localStorage.setItem("usersDb", JSON.stringify(users));

                toast({ title: "Succès", description: "Votre mot de passe a été modifié avec succès." });
                setIsPasswordModalOpen(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        }
    };

    return (
        <MainLayout>
            <div className="w-full h-full animate-fade-in relative flex items-center justify-center">
                <div className="flex w-full h-full">
                    {/* Settings Sidebar */}
                    <div className="w-full md:w-64 space-y-6 absolute top-0 md:top-4 left-4 lg:left-8 z-10">
                        <h1 className="text-3xl font-bold text-navy">Paramètres</h1>
                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveTab("compte")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-left ${activeTab === "compte" ? "bg-white text-navy shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]" : "hover:bg-white/60 text-gray-500 hover:text-navy"}`}
                            >
                                <User className="w-5 h-5" />
                                Compte
                            </button>
                            <button
                                onClick={() => setActiveTab("notifications")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-left ${activeTab === "notifications" ? "bg-white text-navy shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]" : "hover:bg-white/60 text-gray-500 hover:text-navy"}`}
                            >
                                <Bell className="w-5 h-5" />
                                Notifications
                            </button>
                            <button
                                onClick={() => setActiveTab("confidentialite")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-left ${activeTab === "confidentialite" ? "bg-white text-navy shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]" : "hover:bg-white/60 text-gray-500 hover:text-navy"}`}
                            >
                                <Shield className="w-5 h-5" />
                                Confidentialité
                            </button>

                            <div className="pt-4 mt-4 border-t border-gray-200/50">
                                <button
                                    onClick={() => {
                                        localStorage.removeItem("isAuthenticated");
                                        window.location.href = "/login";
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors text-left"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Déconnexion
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Settings Content */}
                    <div className="flex w-full h-full items-center justify-center">
                        <div className="w-full max-w-2xl space-y-6 relative z-0">
                            {activeTab === "compte" && (
                                <Card className="p-6 md:p-8 border-none shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-2xl bg-white animate-fade-in">
                                    <h2 className="text-xl font-semibold text-navy dark:text-white mb-6">Informations personnelles</h2>

                                    <div className="space-y-4">
                                        {/* Avatar Upload */}
                                        <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                                            <div className="relative group">
                                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-navy shadow-lg bg-gray-100 dark:bg-gray-800">
                                                    {userAvatar ? (
                                                        <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                                                            {localStorage.getItem("userName")?.charAt(0) || "E"}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-pink text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-navy dark:text-white">Photo de profil</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cliquez sur le bouton rose pour modifier votre photo.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet</Label>
                                            <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} className="bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl focus-visible:ring-pink focus-visible:border-pink h-12 px-4 shadow-sm" />
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Adresse email</Label>
                                            <Input id="email" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl focus-visible:ring-pink focus-visible:border-pink h-12 px-4 shadow-sm" />
                                        </div>

                                        <div className="flex justify-end pt-1">
                                            <Button onClick={handleSaveProfile} className="bg-navy hover:bg-navy-light text-white rounded-xl px-8 h-11 font-medium shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                                                Enregistrer
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {activeTab === "notifications" && (
                                <Card className="p-6 md:p-8 border-none shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-2xl bg-white animate-fade-in">
                                    <h2 className="text-xl font-semibold text-navy mb-6">Préférences de notification</h2>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-base font-medium text-navy">Notifications push</Label>
                                                <p className="text-sm text-gray-500">Recevoir des notifications sur cet appareil.</p>
                                            </div>
                                            <Switch defaultChecked className="data-[state=checked]:bg-pink" />
                                        </div>

                                        <div className="w-full h-px bg-gray-100"></div>

                                        <div className="flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-base font-medium text-navy">Emails de rappel</Label>
                                                <p className="text-sm text-gray-500">Rappels pour vos prochains cours.</p>
                                            </div>
                                            <Switch defaultChecked className="data-[state=checked]:bg-pink" />
                                        </div>

                                        <div className="w-full h-px bg-gray-100"></div>

                                        <div className="flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-base font-medium text-navy">Mises à jour</Label>
                                                <p className="text-sm text-gray-500">Actualités et nouveautés de l'école.</p>
                                            </div>
                                            <Switch className="data-[state=checked]:bg-pink" />
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {activeTab === "confidentialite" && (
                                <Card className="p-6 md:p-8 border-none shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-2xl bg-white animate-fade-in">
                                    <h2 className="text-xl font-semibold text-navy mb-6">Confidentialité et sécurité</h2>

                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <button
                                                onClick={() => setIsPasswordModalOpen(true)}
                                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100 group"
                                            >
                                                <div className="flex flex-col text-left">
                                                    <span className="font-medium text-navy">Mot de passe</span>
                                                    <span className="text-sm text-gray-500">Mettre à jour vos identifiants</span>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-navy transition-colors" />
                                            </button>

                                            <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100 group">
                                                <div className="flex flex-col text-left">
                                                    <span className="font-medium text-navy">Authentification à deux facteurs</span>
                                                    <span className="text-sm text-gray-500">Sécurisez votre compte avec la 2FA</span>
                                                </div>
                                                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-500 rounded-md">Désactivé</span>
                                            </button>

                                            <div className="w-full h-px bg-gray-100 my-2"></div>

                                            <div className="flex items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-base font-medium text-navy">Profil public</Label>
                                                    <p className="text-sm text-gray-500">Rendre mon profil visible par les autres étudiants.</p>
                                                </div>
                                                <Switch className="data-[state=checked]:bg-pink" />
                                            </div>

                                            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Modifier le mot de passe</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="current">Mot de passe actuel</Label>
                                                            <div className="relative">
                                                                <Input
                                                                    id="current"
                                                                    type={showCurrentPassword ? "text" : "password"}
                                                                    value={currentPassword}
                                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                                    className="bg-gray-50/50 pr-10"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink transition-colors"
                                                                >
                                                                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="new">Nouveau mot de passe</Label>
                                                            <div className="relative">
                                                                <Input
                                                                    id="new"
                                                                    type={showNewPassword ? "text" : "password"}
                                                                    value={newPassword}
                                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                                    className="bg-gray-50/50 pr-10"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink transition-colors"
                                                                >
                                                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="confirm">Confirmer le nouveau mot de passe</Label>
                                                            <div className="relative">
                                                                <Input
                                                                    id="confirm"
                                                                    type={showConfirmPassword ? "text" : "password"}
                                                                    value={confirmPassword}
                                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                                    className="bg-gray-50/50 pr-10"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink transition-colors"
                                                                >
                                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>Annuler</Button>
                                                        <Button onClick={handleChangePassword} className="bg-navy hover:bg-navy-light text-white">Enregistrer</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </Card>
                            )}


                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Settings;
