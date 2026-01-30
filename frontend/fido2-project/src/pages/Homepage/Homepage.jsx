import React from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";

export default function Homepage() {
  const navigate = useNavigate();

  return (
    <div className="home-root">
      <div className="home-card">
        <h1 className="home-title">
          FIDO2 Authentication Platform
        </h1>

        <p className="home-subtitle">
          Passwordless authentication. Secure. Fast. Future-ready.
        </p>

        <Button
          label="Get Started"
          icon="pi pi-lock"
          className="p-button-rounded p-button-info home-cta"
          onClick={() => navigate("/login")}
        />
      </div>
    </div>
  );
}
