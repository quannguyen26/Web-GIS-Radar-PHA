import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import DashBoard from "./pages/DashBoard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminUsers from "./pages/AdminUsers";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ContentPanel from "./components/layout/ContentPanel";
import { ADMIN_ROLES } from "./lib/config/navItems";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Everything nested in "/" keeps the dashboard (and the map)
              mounted, so moving between these pages never reloads the map */}
          <Route path="/" element={<DashBoard />}>
            {/* Login: a modal over the dashboard */}
            <Route path="login" element={<Login />} />

            {/* Full pages drawn over the map area */}
            <Route element={<ContentPanel />}>
              {/* Admin area: every nested route requires an admin role */}
              <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} />}>
                <Route path="admin/users" element={<AdminUsers />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
