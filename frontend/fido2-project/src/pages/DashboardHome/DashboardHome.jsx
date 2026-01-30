import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { ProgressBar } from "primereact/progressbar";
import { Avatar } from "primereact/avatar";
import { InputText } from "primereact/inputtext";

import "./DashboardHome.css";

export default function DashboardHome() {
  const location = useLocation();
  const navigate = useNavigate();

  const username = useMemo(() => {
    const fromState = location.state?.username;
    if (typeof fromState === "string" && fromState.trim()) return fromState.trim();

    const fromStorage = localStorage.getItem("username");
    if (typeof fromStorage === "string" && fromStorage.trim()) return fromStorage.trim();

    return "User";
  }, [location.state]);

  const initials = useMemo(() => {
    const u = username.trim();
    if (!u) return "U";
    const parts = u.split(/[._\s-]+/).filter(Boolean);
    const first = parts[0]?.[0] ?? u[0];
    const second = parts[1]?.[0] ?? "";
    return (first + second).toUpperCase();
  }, [username]);

  const [search, setSearch] = useState("");


  const recent = [
    { icon: "pi pi-key", title: "Security key registered", meta: "WebAuthn • 2 days ago" },
    { icon: "pi pi-sign-in", title: "Signed in successfully", meta: "Passwordless • Today" },
    { icon: "pi pi-shield", title: "Policy updated", meta: "MFA rules • 1 week ago" },
  ];

  const onLogout = () => {
    localStorage.removeItem("username");
     const autheliaLogoutUrl =
    "https://auth.localtest.me/logout?rd=https://app.localtest.me";

    window.location.href = autheliaLogoutUrl;
  };

  return (
    <div className="dash2-page">
      <div className="dash2-shell">
        <header className="dash2-topbar">
          <div className="dash2-brand" onClick={() => navigate("/")}>
            <span className="dash2-brandMark" />
            <span className="dash2-brandText">FIDO2 Platform</span>
          </div>

          <div className="dash2-user">
            <Tag
              value={"Security Key: Available"}
              severity={"success"}
              className="dash2-tag"
            />
            <div className="dash2-userChip">
              <Avatar label={initials} shape="circle" className="dash2-avatar" />
              <div className="dash2-userMeta">
                <div className="dash2-userName">{username}</div>
              </div>
            </div>
            <Button
              icon="pi pi-sign-out"
              className="p-button-rounded p-button-text dash2-logout"
              onClick={onLogout}
              aria-label="Logout"
            />
          </div>
        </header>

        <section className="dash2-hero">
          <div className="dash2-heroLeft">
            <h1 className="dash2-title">
              Hello, <span className="dash2-username">{username}</span>
            </h1>
            <p className="dash2-subtitle">
              Manage your passwordless identity, devices, and security posture.
            </p>

            <div className="dash2-heroActions">
              <div className="dash2-center">
                <Button
                  label="Register Security Key"
                  icon="pi pi-key"
                  className="p-button-rounded p-button-info dash2-primary"
                  onClick={() => (window.location.href = "https://auth.localtest.me/settings/security")}
                />
              </div>
            </div>
          </div>

        </section>

        <Divider className="dash2-divider" />





      </div>
    </div>
  );
}
