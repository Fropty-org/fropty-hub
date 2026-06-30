"use server";

import { Resend } from "resend";

export type ActivationPayload = {
  name: string;
  email: string;
  company: string;
  context?: string;
};

export type ActivationResult = { ok: true } | { ok: false; error: string };

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitize(str: unknown, maxLen = 2000): string {
  if (typeof str !== "string") return "";
  return escHtml(str.trim().slice(0, maxLen));
}

export async function submitActivation(payload: ActivationPayload): Promise<ActivationResult> {
  const contactEmail = process.env.CONTACT_EMAIL;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!contactEmail || !resendApiKey) {
    return { ok: false, error: "Configuração de email ausente no servidor." };
  }

  const name = sanitize(payload.name, 100);
  const email = sanitize(payload.email, 200);
  const company = sanitize(payload.company, 200);
  const context = sanitize(payload.context, 2000);

  if (!name || !email || !company) {
    return { ok: false, error: "Nome, email e empresa são obrigatórios." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { ok: false, error: "Email inválido." };
  }

  const resend = new Resend(resendApiKey);

  const { error } = await resend.emails.send({
    from: "Fropty Hub <onboarding@resend.dev>",
    to: contactEmail,
    replyTo: email,
    subject: `Novo pedido de ativação do Hub — ${company}`,
    html: `
      <h2 style="color:#185FA5">Novo pedido de ativação — Fropty Hub</h2>
      <table style="border-collapse:collapse;width:100%;font-family:sans-serif">
        <tr><td style="padding:10px;font-weight:700;background:#f0f4ff;color:#185FA5;width:160px">Nome</td><td style="padding:10px;background:#f0f4ff">${name}</td></tr>
        <tr><td style="padding:10px;font-weight:700;background:#fff">Email</td><td style="padding:10px;background:#fff"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:10px;font-weight:700;background:#f0f4ff">Empresa</td><td style="padding:10px;background:#f0f4ff">${company}</td></tr>
        <tr><td style="padding:10px;font-weight:700;background:#fff">Contexto</td><td style="padding:10px;background:#fff">${context ? context.replace(/\n/g, "<br>") : "—"}</td></tr>
      </table>
      <p style="margin-top:20px;font-size:13px;color:#666">Ativar acesso em até 24h úteis e enviar credenciais por email.</p>
    `,
    text: [
      "Novo pedido de ativação — Fropty Hub",
      `Nome: ${name}`,
      `Email: ${email}`,
      `Empresa: ${company}`,
      `Contexto: ${context || "—"}`,
    ].join("\n"),
  });

  if (error) {
    return { ok: false, error: "Falha ao enviar o email. Tente novamente." };
  }

  return { ok: true };
}
