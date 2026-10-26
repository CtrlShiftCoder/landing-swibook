import { createHash } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

type Role = "professional" | "client";

type WaitlistBody = {
  name?: string;
  email?: string;
  role?: Role | "";
  business?: string;
  locale?: string;
  createdAt?: string;
  source?: string;
};

const ALLOWED_ORIGINS = [
  "https://swibook.sibylab.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function parseTo(raw: string) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function cors(res: VercelResponse, origin: string | undefined) {
  const allow =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader("Access-Control-Allow-Origin", allow);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
}

function idempotencyKey(email: string) {
  const day = new Date().toISOString().slice(0, 10);
  const hash = createHash("sha256")
    .update(`swibook-waitlist:${email}:${day}`)
    .digest("hex")
    .slice(0, 32);
  return `swibook-waitlist/${hash}`.slice(0, 256);
}

function roleLabel(role: Role, locale: string) {
  if (locale.startsWith("en")) {
    return role === "professional" ? "Professional / business" : "Client / booker";
  }
  return role === "professional"
    ? "Profesional / negocio"
    : "Cliente / quiere reservar";
}

function buildEmail(input: {
  name: string;
  email: string;
  role: Role;
  business: string;
  locale: string;
}) {
  const role = roleLabel(input.role, input.locale);
  const name = input.name || "—";
  const business = input.business || "—";

  const text = [
    "[Swibook] Nuevo registro en lista de espera",
    `Nombre: ${name}`,
    `Email: ${input.email}`,
    `Rol: ${role}`,
    `Negocio: ${business}`,
    `Idioma: ${input.locale}`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:24px;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;">
    <tr>
      <td style="padding:24px 28px;background:#0b1220;border-radius:16px 16px 0 0;">
        <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#7dd3fc;font-weight:700;">Swibook · Lista de espera</div>
        <h1 style="margin:10px 0 0;font-size:22px;line-height:1.25;color:#fff;">Nuevo lead</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 28px;">
        <p style="margin:0 0 16px;color:#4b5563;font-size:15px;">Alguien se sumó a la lista de espera de <strong>Swibook</strong>.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:10px 12px;background:#f8fafc;border-radius:10px;margin-bottom:8px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;font-weight:700;">Nombre</div><div style="margin-top:4px;font-weight:600;">${escapeHtml(name)}</div></td></tr>
          <tr><td style="height:8px;"></td></tr>
          <tr><td style="padding:10px 12px;background:#f8fafc;border-radius:10px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;font-weight:700;">Email</div><div style="margin-top:4px;font-weight:600;color:#0369a1;">${escapeHtml(input.email)}</div></td></tr>
          <tr><td style="height:8px;"></td></tr>
          <tr><td style="padding:10px 12px;background:#f8fafc;border-radius:10px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;font-weight:700;">Rol</div><div style="margin-top:4px;font-weight:600;">${escapeHtml(role)}</div></td></tr>
          <tr><td style="height:8px;"></td></tr>
          <tr><td style="padding:10px 12px;background:#f8fafc;border-radius:10px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;font-weight:700;">Negocio</div><div style="margin-top:4px;font-weight:600;">${escapeHtml(business)}</div></td></tr>
          <tr><td style="height:8px;"></td></tr>
          <tr><td style="padding:10px 12px;background:#f8fafc;border-radius:10px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;font-weight:700;">Idioma</div><div style="margin-top:4px;font-weight:600;">${escapeHtml(input.locale)}</div></td></tr>
        </table>
        <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">Tag Resend: product=swibook · Reply-To = el lead.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { text, html };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  cors(res, typeof origin === "string" ? origin : undefined);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const toRaw = process.env.CONTACT_TO_EMAIL?.trim() || "contacto@sibylab.com";
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Swibook <contacto@sibylab.com>";

  if (!apiKey) {
    console.error("[waitlist] Missing RESEND_API_KEY");
    return res.status(500).json({ ok: false, error: "config" });
  }

  const body = (req.body ?? {}) as WaitlistBody;
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const name = String(body.name ?? "").trim();
  const business = String(body.business ?? "").trim();
  const locale = String(body.locale ?? "es").trim() || "es";
  const role = body.role;

  if (!email || !email.includes("@") || email.length > 254) {
    return res.status(400).json({ ok: false, error: "invalid_email" });
  }
  if (role !== "professional" && role !== "client") {
    return res.status(400).json({ ok: false, error: "invalid_role" });
  }

  const { text, html } = buildEmail({ name, email, role, business, locale });
  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send(
    {
      from,
      to: parseTo(toRaw),
      subject: `[Swibook] Lista de espera: ${email}`,
      replyTo: email,
      text,
      html,
      tags: [
        { name: "product", value: "swibook" },
        { name: "source", value: "landing" },
        { name: "kind", value: "waitlist" },
        { name: "role", value: role },
      ],
    },
    { idempotencyKey: idempotencyKey(email) },
  );

  if (error) {
    console.error("[waitlist] Resend error", error);
    return res.status(502).json({ ok: false, error: "send" });
  }

  return res.status(200).json({ ok: true, id: data?.id });
}
