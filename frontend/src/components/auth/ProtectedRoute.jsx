import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Forbidden from "../../pages/Forbidden";

// Layout route guard: renders the nested routes (<Outlet />) only for
// logged-in users whose roleCode is in allowedRoles (if given).
// This only hides UI; the backend still checks every API call.
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Wait for the session restore on page load (F5), otherwise a logged-in
  // user would be sent to /login before /auth/refresh finishes
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
        <Loader2
          size={32}
          className="animate-spin text-indigo-500"
          aria-label="Đang tải"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.roleCode)) {
    return <Forbidden />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
