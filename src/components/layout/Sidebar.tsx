import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, GraduationCap, HelpCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.jpg";

export function Sidebar() {
  const location = useLocation();
  const userRole = localStorage.getItem("userRole");

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: userRole === "admin" ? "/admin" : "/" },
    ...(userRole === "admin" ? [{ icon: GraduationCap, label: "Student View", path: "/" }] : []),
    { icon: Calendar, label: "Schedule", path: "/schedule" },
    { icon: GraduationCap, label: "Studies", path: "/studies" },
    { icon: HelpCircle, label: "Help", path: "/help" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-28 bg-background transition-all duration-300 border-none h-[calc(100vh-32px)] fixed left-6 top-4 z-50 rounded-[30px] py-4">
      {/* Logo */}
      <div className="flex flex-col items-center justify-center mb-6 px-1.5 w-full">
        <img src={logo} alt="Rennes School of Business" className="w-[120%] max-w-none object-contain" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-4 w-full px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 group",
                isActive
                  ? "text-navy bg-transparent" // Active: Navy icon/text, transparent bg
                  : "text-slate-400 hover:text-navy hover:bg-white/50"
              )}
            >
              <item.icon
                className={cn(
                  "w-6 h-6 mb-1.5 transition-transform duration-300",
                  isActive ? "scale-105" : "group-hover:scale-105"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn("text-[10px] font-semibold", isActive ? "font-bold" : "")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="pb-6 flex justify-center w-full px-2">
        <button
          onClick={() => {
            localStorage.removeItem("isAuthenticated");
            window.location.href = "/login";
          }}
          className="flex flex-col items-center justify-center w-16 h-16 text-slate-400 hover:text-navy transition-colors group"
        >
          <LogOut className="w-5 h-5 mb-1.5 group-hover:scale-105 transition-transform" strokeWidth={2} />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}