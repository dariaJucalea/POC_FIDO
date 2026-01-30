import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function isAuthenticated() {
  const u = localStorage.getItem("username");
  return typeof u === "string" && u.trim().length > 0;
}

export default function PublicOnlyRoute() {
  if (isAuthenticated()) {
    return <Navigate to="/app" replace />;
  }
  return <Outlet />;
}
