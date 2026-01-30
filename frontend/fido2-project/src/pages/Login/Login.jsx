import React, { useMemo, useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import "./Login.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const errors = useMemo(() => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!form.username.trim()) e.username = "Username is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!emailRegex.test(form.email)) e.email = "Invalid email format.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8) e.password = "Min 8 characters.";
    return e;
  }, [form]);

  const canSubmit = Object.keys(errors).length === 0 && !submitting;

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const resp = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.ok) {
        throw new Error(data.message || `Register failed (${resp.status})`);
      }

      setSuccessMsg(
        "Account created. Redirecting to Authelia sign-in…"
      );

      window.location.href =
        "https://auth.localtest.me/?rd=" +
        encodeURIComponent("https://app.localtest.me/auth/callback");
    } catch (err) {
      setFormError(String(err?.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  const goToAutheliaSignIn = () => {
    window.location.href =
      "https://auth.localtest.me/?rd=" +
      encodeURIComponent("https://app.localtest.me/auth/callback");
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <Card className="login-card login-animate-in">
          <div className="login-header">
            <div className="login-badge">
              <i className="pi pi-shield" />
            </div>
            <h1 className="login-title">Create account</h1>
          </div>

          <Divider />

          {formError && (
            <div className="login-errorBanner" role="alert">
              {formError}
            </div>
          )}

          {successMsg && (
            <div className="login-successBanner" role="status">
              {successMsg}
            </div>
          )}

          <form className="login-formPanel is-active" onSubmit={onSubmit}>
            <div className="login-grid-2">
              <div className="login-field">
                <label className="login-label" htmlFor="reg-firstName">
                  First name
                </label>
                <InputText
                  id="reg-firstName"
                  value={form.firstName}
                  onChange={(ev) => setForm((s) => ({ ...s, firstName: ev.target.value }))}
                  placeholder="e.g. John"
                  className={errors.firstName ? "p-invalid" : ""}
                  autoComplete="given-name"
                />
                {errors.firstName && <small className="login-error">{errors.firstName}</small>}
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="reg-lastName">
                  Last name
                </label>
                <InputText
                  id="reg-lastName"
                  value={form.lastName}
                  onChange={(ev) => setForm((s) => ({ ...s, lastName: ev.target.value }))}
                  placeholder="e.g. Doe"
                  className={errors.lastName ? "p-invalid" : ""}
                  autoComplete="family-name"
                />
                {errors.lastName && <small className="login-error">{errors.lastName}</small>}
              </div>
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="reg-email">
                Email
              </label>

              <span className="p-input-icon-left login-icon-input">
                <i className="pi pi-envelope" />
                <InputText
                  id="reg-email"
                  value={form.email}
                  onChange={(ev) => setForm((s) => ({ ...s, email: ev.target.value }))}
                  placeholder="e.g. john@company.com"
                  className={errors.email ? "p-invalid" : ""}
                  autoComplete="email"
                />
              </span>

              {errors.email && <small className="login-error">{errors.email}</small>}
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="reg-username">
                Username
              </label>

              <span className="p-input-icon-left login-icon-input">
                <i className="pi pi-user" />
                <InputText
                  id="reg-username"
                  value={form.username}
                  onChange={(ev) => setForm((s) => ({ ...s, username: ev.target.value }))}
                  placeholder="e.g. john_doe"
                  className={errors.username ? "p-invalid" : ""}
                  autoComplete="username"
                />
              </span>

              {errors.username && <small className="login-error">{errors.username}</small>}
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="reg-password">
                Password
              </label>

              <Password
                id="reg-password"
                value={form.password}
                onChange={(ev) => setForm((s) => ({ ...s, password: ev.target.value }))}
                feedback={false}
                toggleMask
                className={errors.password ? "p-invalid" : ""}
                inputClassName={errors.password ? "p-invalid" : ""}
                placeholder="Min 8 characters"
              />

              {errors.password && <small className="login-error">{errors.password}</small>}
            </div>

            <div className="login-actions">
              <Button
                label={submitting ? "Creating..." : "Create account"}
                icon="pi pi-check"
                className="p-button-rounded p-button-info login-primary"
                type="submit"
                disabled={!canSubmit}
              />
              <Button
                label="Sign in"
                icon="pi pi-sign-in"
                className="p-button-rounded p-button-outlined login-secondary"
                type="button"
                onClick={goToAutheliaSignIn}
                disabled={submitting}
              />

            </div>

            <div style={{ marginTop: 12, opacity: 0.85 }}>
              <small>
                After creating the account you’ll be redirected to Authelia to sign in.
                Then you can add a passkey in <b>Authelia → Settings → Security</b>.
              </small>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
