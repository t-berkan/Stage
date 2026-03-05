import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Schedule from "./pages/Schedule";
import Studies from "./pages/Studies";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";

const ProtectedRoute = ({ children, allowedRoles, adminAllowed = false }: { children: React.ReactNode, allowedRoles?: string[], adminAllowed?: boolean }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("userRole");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    if (!userRole) {
      // User has no role defined (likely from an old session), force them to re-login
      localStorage.removeItem("isAuthenticated");
      return <Navigate to="/login" replace />;
    }

    // If it's a student route but admins are allowed
    if (adminAllowed && userRole === "admin") {
      return <>{children}</>;
    }

    // Normal strict redirect
    return <Navigate to={userRole === "admin" ? "/admin" : "/"} replace />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient();

// Initialize theme
const initializeTheme = () => {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};
initializeTheme();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />

          {/* Student & Admin Shared Routes */}
          <Route path="/" element={<ProtectedRoute allowedRoles={["student", "teacher"]} adminAllowed><Index /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute allowedRoles={["student", "teacher"]} adminAllowed><Schedule /></ProtectedRoute>} />
          <Route path="/studies" element={<ProtectedRoute allowedRoles={["student", "teacher"]} adminAllowed><Studies /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute allowedRoles={["student", "teacher"]} adminAllowed><Help /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={["student", "teacher"]} adminAllowed><Settings /></ProtectedRoute>} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
