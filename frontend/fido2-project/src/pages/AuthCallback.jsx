import React, { useEffect, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";

export default function AuthCallback() {
  const [status, setStatus] = useState("Verifying session...");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const resp = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
          headers: { accept: "application/json" },
        });

        if (!resp.ok) {
          throw new Error(`Not authenticated (${resp.status})`);
        }

        const data = await resp.json();

        if (!data?.authenticated || !data?.user) {
          throw new Error("No authenticated user");
        }

        localStorage.setItem("username", data.user);
        if (data.email) localStorage.setItem("email", data.email);
        if (data.name) localStorage.setItem("name", data.name);

        if (!cancelled) {
          setStatus("Signed in. Redirecting...");
          window.location.replace("/app");
        }
      } catch (e) {
        if (!cancelled) {
          setStatus("Not signed in. Redirecting to sign-in...");
          window.location.replace("/api/me");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <ProgressSpinner />
        <div style={{ marginTop: 16, opacity: 0.8 }}>{status}</div>
      </div>
    </div>
  );
}
