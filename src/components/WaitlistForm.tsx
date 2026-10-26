import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import "./WaitlistForm.css";

const STORAGE_KEY = "swibook-waitlist";

type Status = "idle" | "loading" | "done" | "error";
type Role = "" | "professional" | "client";

function waitlistEndpoint() {
  const fromEnv = import.meta.env.VITE_WAITLIST_ENDPOINT as string | undefined;
  return (fromEnv?.trim() || "/api/waitlist").replace(/\/$/, "") || "/api/waitlist";
}

export function WaitlistForm() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("");
  const [business, setBusiness] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setStatus("error");
      setMessage(t("waitlist.errorEmail"));
      return;
    }
    if (role !== "professional" && role !== "client") {
      setStatus("error");
      setMessage(t("waitlist.errorRole"));
      return;
    }

    setStatus("loading");
    const payload = {
      name: name.trim(),
      email: trimmedEmail,
      role,
      business: role === "professional" ? business.trim() : "",
      locale: document.documentElement.lang || "es",
      createdAt: new Date().toISOString(),
      source: "landing-waitlist",
    };

    try {
      const res = await fetch(waitlistEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Local vite without serverless: keep a demo fallback so UX still works
        if (import.meta.env.DEV && (res.status === 404 || res.status === 405)) {
          const prev = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]",
          ) as unknown[];
          const exists = prev.some(
            (row) =>
              typeof row === "object" &&
              row !== null &&
              "email" in row &&
              (row as { email: string }).email === trimmedEmail,
          );
          if (!exists) {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify([...prev, payload]),
            );
          }
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      }

      setStatus("done");
      setMessage(t("waitlist.success"));
      setName("");
      setEmail("");
      setRole("");
      setBusiness("");
    } catch {
      setStatus("error");
      setMessage(t("waitlist.errorGeneric"));
    }
  };

  if (status === "done") {
    return (
      <div className="waitlist waitlist-done" role="status">
        <p className="waitlist-success">{message}</p>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setStatus("idle")}
        >
          {t("waitlist.again")}
        </button>
      </div>
    );
  }

  return (
    <form className="waitlist" onSubmit={onSubmit} noValidate>
      <div className="waitlist-grid">
        <label className="waitlist-field">
          <span>{t("waitlist.name")}</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("waitlist.namePlaceholder")}
          />
        </label>
        <label className="waitlist-field">
          <span>{t("waitlist.email")}</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("waitlist.emailPlaceholder")}
          />
        </label>
        <label className="waitlist-field waitlist-field-full">
          <span>{t("waitlist.role")}</span>
          <select
            name="role"
            required
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="" disabled>
              —
            </option>
            <option value="professional">
              {t("waitlist.roleProfessional")}
            </option>
            <option value="client">{t("waitlist.roleClient")}</option>
          </select>
        </label>
        {role === "professional" && (
          <label className="waitlist-field waitlist-field-full">
            <span>{t("waitlist.business")}</span>
            <input
              type="text"
              name="business"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder={t("waitlist.businessPlaceholder")}
            />
          </label>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary waitlist-submit"
        disabled={status === "loading"}
      >
        {status === "loading" ? t("waitlist.submitting") : t("waitlist.submit")}
      </button>

      <p className="waitlist-note">{t("waitlist.note")}</p>
      {status === "error" && (
        <p className="waitlist-error" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
