import { BrowserRouter, Routes, Route } from "react-router-dom";

import Homepage from "./pages/Homepage/Homepage.jsx";
import Login from "./pages/Login/Login.jsx";
import DashboardHome from "./pages/DashboardHome/DashboardHome.jsx";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import PublicOnlyRoute from "./routes/PublicOnlyRoute.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} /> 
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<DashboardHome />} />
        </Route>

        <Route path="*" element={<div style={{ color: "white", padding: 24 }}>Not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
