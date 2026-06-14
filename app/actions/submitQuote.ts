"use server";

import { Resend } from "resend";

export type QuotePayload = {
  nome: string;
  email: string;
  ideia: string;
  temLogo?: string;
  cores?: string;
  prioridades?: string[];
};

export type QuoteResult = { ok: true } | { ok: false; error: string };

function sanitize(str: unknown, maxLen = 2000): string {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, maxLen).replace(/<[^>]*>/g, "");
}

export async function submitQuote(payload: QuotePayload): Promise<QuoteResult> {
  const contactEmail = process.env.CONTACT_EMAIL;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!contactEmail || !resendApiKey) {
    return { ok: false, error: "Configuração de email ausente no servidor." };
  }

  const nome = sanitize(payload.nome, 100);
  const email = sanitize(payload.email, 200);
  const ideia = sanitize(payload.ideia, 3000);
  const temLogo = sanitize(payload.temLogo, 50);
  const cores = sanitize(payload.cores, 200);
  const prioridades = (payload.prioridades ?? [])
    .map((p) => sanitize(p, 100))
    .filter(Boolean)
    .slice(0, 10);

  if (!nome || !email || !ideia) {
    return { ok: false, error: "Nome, email e ideia são obrigatórios." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { ok: false, error: "Email inválido." };
  }

  const resend = new Resend(resendApiKey);

  const { error } = await resend.emails.send({
    from: "Fropty Apps <onboarding@resend.dev>",
    to: contactEmail,
    replyTo: email,
    subject: `Novo pedido de orçamento — ${nome}`,
    html: `
      <h2>Novo pedido de orçamento</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;font-weight:700;background:#f8f8f8">Nome</td><td style="padding:8px">${nome}</td></tr>
        <tr><td style="padding:8px;font-weight:700;background:#f8f8f8">Email</td><td style="padding:8px"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:8px;font-weight:700;background:#f8f8f8">Ideia</td><td style="padding:8px">${ideia.replace(/\n/g, "<br>")}</td></tr>
        <tr><td style="padding:8px;font-weight:700;background:#f8f8f8">Tem logo?</td><td style="padding:8px">${temLogo || "não informado"}</td></tr>
        <tr><td style="padding:8px;font-weight:700;background:#f8f8f8">Cores/tema</td><td style="padding:8px">${cores || "não informado"}</td></tr>
        <tr><td style="padding:8px;font-weight:700;background:#f8f8f8">Prioridades</td><td style="padding:8px">${prioridades.length ? prioridades.join(", ") : "não informado"}</td></tr>
      </table>
    `,
    text: [
      `Nome: ${nome}`,
      `Email: ${email}`,
      `Ideia: ${ideia}`,
      `Tem logo: ${temLogo || "não informado"}`,
      `Cores: ${cores || "não informado"}`,
      `Prioridades: ${prioridades.join(", ") || "não informado"}`,
    ].join("\n"),
  });

  if (error) {
    return { ok: false, error: "Falha ao enviar o email. Tente novamente." };
  }

  return { ok: true };
}
