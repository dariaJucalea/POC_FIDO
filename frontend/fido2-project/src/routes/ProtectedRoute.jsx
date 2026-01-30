import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

function isAuthenticated() {
  const u = localStorage.getItem("username");
  return typeof u === "string" && u.trim().length > 0;
}

export default function ProtectedRoute() {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
