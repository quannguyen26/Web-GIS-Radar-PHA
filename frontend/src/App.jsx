import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import DashBoard from "./pages/DashBoard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminUsers from "./pages/AdminUsers";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ADMIN_ROLES } from "./lib/config/navItems";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<DashBoard />} />
          <Route path="/login" element={<Login />} />

          {/* Admin area: every nested route requires an admin role */}
          <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} />}>
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
