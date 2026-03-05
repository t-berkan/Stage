import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GraduationCap, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate an API call
        setTimeout(() => {
            setIsLoading(false);

            // Fetch users (or use default admin + teachers if empty)
            let users: any[] = [];
            const storedUsers = localStorage.getItem("usersDb");
            if (storedUsers) {
                users = JSON.parse(storedUsers);
            } else {
                users = [
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
                    { id: "student-1", firstName: "Alice", lastName: "Dupont", email: "student@rsb.edu", password: "password123", role: "student", filiere: "Marketing", createdAt: new Date().toISOString() },
                    { id: "student-2", firstName: "Bob", lastName: "Martin", email: "bob@rsb.edu", password: "password123", role: "student", filiere: "Finance", createdAt: new Date().toISOString() },
                    { id: "student-3", firstName: "Charlie", lastName: "Bernard", email: "charlie@rsb.edu", password: "password123", role: "student", filiere: "Data", createdAt: new Date().toISOString() },
                    { id: "student-4", firstName: "Diane", lastName: "Thomas", email: "diane@rsb.edu", password: "password123", role: "student", filiere: "Marketing", createdAt: new Date().toISOString() },
                    { id: "student-5", firstName: "Etienne", lastName: "Petit", email: "etienne@rsb.edu", password: "password123", role: "student", filiere: "Supply Chain", createdAt: new Date().toISOString() },
                    { id: "student-6", firstName: "Fanny", lastName: "Leroy", email: "fanny@rsb.edu", password: "password123", role: "student", filiere: "Entrepreneuriat", createdAt: new Date().toISOString() },
                    { id: "student-7", firstName: "Gilles", lastName: "Moreau", email: "gilles@rsb.edu", password: "password123", role: "student", filiere: "Cyber", createdAt: new Date().toISOString() },
                ];

                localStorage.setItem("usersDb", JSON.stringify(users));
            }

            // Find user
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem("isAuthenticated", "true");
                localStorage.setItem("userId", user.id);
                localStorage.setItem("userEmail", user.email);
                localStorage.setItem("userRole", user.role);
                localStorage.setItem("userName", user.firstName);
                localStorage.setItem("userFiliere", user.filiere || "");

                toast({
                    title: "Connexion réussie",
                    description: `Bienvenue ${user.firstName}.`,
                });

                if (user.role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/");
                }
            } else {
                toast({
                    variant: "destructive",
                    title: "Erreur de connexion",
                    description: "Identifiants incorrects ou compte inexistant.",
                });
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 animate-fade-in relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-pink/5 blur-[120px]" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-navy/5 blur-[120px]" />
            </div>

            <Card className="w-full max-w-md p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white/80 backdrop-blur-xl relative">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center border border-gray-100/50 rotate-3 transition-transform hover:rotate-6">
                    <GraduationCap className="w-12 h-12 text-navy" strokeWidth={1.5} />
                </div>

                <div className="text-center mt-12 mb-8 space-y-2">
                    <h1 className="text-3xl font-bold text-navy tracking-tight">Espace Étudiant</h1>
                    <p className="text-gray-500 text-sm">Connectez-vous pour accéder à votre emploi du temps et vos notes.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2 relative group">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 ml-1">Email académique</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0A3161] transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="prenom.nom@edu.school.com"
                                    className="pl-10 h-12 bg-gray-50/50 border-gray-100 rounded-xl focus-visible:ring-[#0A3161] focus-visible:border-[#0A3161] shadow-sm transition-all hover:bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 relative group">
                            <div className="flex items-center justify-between ml-1">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe</Label>
                                <a href="#" className="text-xs text-[#0A3161] hover:text-[#0A3161]/80 font-medium transition-colors">Mot de passe oublié ?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0A3161] transition-colors" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-10 pr-10 h-12 bg-gray-50/50 border-gray-100 rounded-xl focus-visible:ring-[#0A3161] focus-visible:border-[#0A3161] shadow-sm transition-all hover:bg-white"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0A3161] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-navy hover:bg-navy-light text-white rounded-xl font-medium shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden group"
                        disabled={isLoading}
                    >
                        <span className={`transition-opacity ${isLoading ? "opacity-0" : "opacity-100"}`}>
                            Se connecter
                        </span>
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                        )}
                    </Button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    En vous connectant, vous acceptez les <a href="#" className="underline hover:text-navy transition-colors">conditions d'utilisation</a> de la plateforme.
                </div>
            </Card>
        </div>
    );
};

export default Login;
