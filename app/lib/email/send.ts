import { Resend } from "resend";

// Lazy — evita erro de build quando RESEND_API_KEY não está definida
let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "Fropty Apps <noreply@fropty.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://fropty.com";

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fropty Apps</title></head>
<body style="margin:0;padding:0;background:#040316;font-family:'Inter',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:32px auto;">
    <tr><td style="padding:0 24px 32px;">
      <!-- Logo -->
      <div style="margin-bottom:28px;">
        <span style="font-size:20px;font-weight:800;color:#F7F8FC;">Fropty<span style="color:#5B57E8;">Apps</span></span>
      </div>
      <!-- Card -->
      <div style="background:#110E67;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px 24px;">
        ${content}
      </div>
      <!-- Footer -->
      <p style="font-size:11px;color:#334155;text-align:center;margin-top:20px;">
        Fropty Apps · <a href="${APP_URL}" style="color:#5B57E8;text-decoration:none;">fropty.com</a>
      </p>
    </td></tr>
  </table>
</body></html>`;
}

function btn(text: string, url: string) {
  return `<a href="${url}" style="display:inline-block;margin-top:20px;padding:11px 24px;background:#5B57E8;color:#fff;font-weight:700;font-size:14px;border-radius:10px;text-decoration:none;">${text}</a>`;
}

function tag(text: string, color = "#5B57E8") {
  return `<span style="display:inline-block;padding:2px 10px;border-radius:999px;background:${color}22;color:${color};font-size:11px;font-weight:700;border:1px solid ${color}30;">${text}</span>`;
}

// ── Novo ticket aberto (para o time interno) ──────────────────────
export async function sendNewTicketAlert(opts: {
  subject: string;
  category: string;
  clientName: string;
  clientEmail: string;
  ticketId: string;
}) {
  const adminEmail = process.env.CONTACT_EMAIL;
  if (!adminEmail) return;

  await getResend().emails.send({
    from: FROM,
    to:   adminEmail,
    subject: `[Novo chamado] ${opts.subject}`,
    html: baseTemplate(`
      <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;">Novo chamado aberto</p>
      <h2 style="margin:0 0 16px;font-size:18px;font-weight:800;color:#F7F8FC;">${opts.subject}</h2>
      ${tag(opts.category)}
      <div style="margin-top:16px;font-size:13px;color:#94a3b8;line-height:1.6;">
        <p style="margin:4px 0;"><strong style="color:#F7F8FC;">Cliente:</strong> ${opts.clientName}</p>
        <p style="margin:4px 0;"><strong style="color:#F7F8FC;">E-mail:</strong> ${opts.clientEmail}</p>
      </div>
      ${btn("Abrir chamado", `${APP_URL}/dev/tasks/${opts.ticketId}`)}
    `),
  }).catch((e) => console.error("[email] sendNewTicketAlert:", e));
}

// ── Nova mensagem no ticket (para o destinatário) ────────────────
export async function sendNewMessageAlert(opts: {
  toEmail: string;
  toName: string;
  fromName: string;
  senderRole: "cliente" | "dev" | "admin";
  ticketSubject: string;
  ticketId: string;
  preview: string;
}) {
  const isClient = opts.senderRole !== "cliente";
  const destUrl = isClient
    ? `${APP_URL}/portal/suporte/${opts.ticketId}`
    : `${APP_URL}/dev/tasks/${opts.ticketId}`;

  await getResend().emails.send({
    from: FROM,
    to:   opts.toEmail,
    subject: `Nova resposta: ${opts.ticketSubject}`,
    html: baseTemplate(`
      <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;">${opts.fromName} respondeu seu chamado</p>
      <h2 style="margin:0 0 16px;font-size:18px;font-weight:800;color:#F7F8FC;">${opts.ticketSubject}</h2>
      <div style="background:rgba(255,255,255,0.05);border-left:3px solid #5B57E8;border-radius:4px;padding:12px 16px;margin:16px 0;">
        <p style="margin:0;font-size:13px;color:#cbd5e1;font-style:italic;line-height:1.6;">${opts.preview.slice(0, 200)}${opts.preview.length > 200 ? "…" : ""}</p>
      </div>
      ${btn("Ver conversa", destUrl)}
    `),
  }).catch((e) => console.error("[email] sendNewMessageAlert:", e));
}

// ── Alerta de tokens baixos ───────────────────────────────────────
export async function sendLowTokenAlert(opts: {
  toEmail: string;
  toName: string;
  balance: number;
}) {
  await getResend().emails.send({
    from: FROM,
    to:   opts.toEmail,
    subject: "Seus tokens estão acabando — Fropty Apps",
    html: baseTemplate(`
      <p style="margin:0 0 6px;font-size:13px;color:#EF9F27;">⚠ Atenção</p>
      <h2 style="margin:0 0 12px;font-size:18px;font-weight:800;color:#F7F8FC;">Seus tokens estão acabando</h2>
      <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0 0 8px;">
        Olá, <strong style="color:#F7F8FC;">${opts.toName.split(" ")[0]}</strong>!
        Você tem apenas <strong style="color:#EF9F27;">${opts.balance} token${opts.balance !== 1 ? "s" : ""}</strong> disponível${opts.balance !== 1 ? "s" : ""}.
      </p>
      <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0;">
        Recarregue para continuar usando o suporte sem interrupções.
      </p>
      ${btn("Recarregar tokens", `${APP_URL}/portal/financeiro`)}
    `),
  }).catch((e) => console.error("[email] sendLowTokenAlert:", e));
}

// ── Confirmação de plano ──────────────────────────────────────────
export async function sendPlanConfirmation(opts: {
  toEmail: string;
  toName: string;
  plan: "basico" | "pro";
  tokens: number;
}) {
  const planLabel = opts.plan === "pro" ? "Pro" : "Básico";
  await getResend().emails.send({
    from: FROM,
    to:   opts.toEmail,
    subject: `Plano ${planLabel} ativado — Fropty Apps`,
    html: baseTemplate(`
      <p style="margin:0 0 6px;font-size:13px;color:#22c55e;">✓ Confirmação</p>
      <h2 style="margin:0 0 12px;font-size:18px;font-weight:800;color:#F7F8FC;">Plano ${planLabel} ativado!</h2>
      <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0 0 16px;">
        Olá, <strong style="color:#F7F8FC;">${opts.toName.split(" ")[0]}</strong>!
        Seu plano foi ativado com sucesso e <strong style="color:#5B57E8;">${opts.tokens} tokens</strong> foram creditados na sua conta.
      </p>
      ${btn("Acessar minha conta", `${APP_URL}/portal/dashboard`)}
    `),
  }).catch((e) => console.error("[email] sendPlanConfirmation:", e));
}
