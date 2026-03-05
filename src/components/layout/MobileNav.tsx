import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, GraduationCap, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const location = useLocation();
  const userRole = localStorage.getItem("userRole");

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: userRole === "admin" ? "/admin" : "/" },
    { icon: Calendar, label: "Schedule", path: "/schedule" },
    { icon: GraduationCap, label: "Studies", path: "/studies" },
    { icon: HelpCircle, label: "Help", path: "/help" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around py-2 px-4 safe-area-pb">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200",
                isActive
                  ? "text-pink"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}