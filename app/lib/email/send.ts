import { Resend } from "resend";

// Lazy — evita erro de build quando RESEND_API_KEY não está definida.
// Retorna null se a chave não estiver configurada, para os envios serem
// ignorados com segurança (sem derrubar a request com unhandled rejection).
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY não configurada — e-mail não enviado.");
    return null;
  }
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "FroptyHub <noreply@fropty.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://fropty.com";
// Área autenticada (portal/admin) — quando configurada, vive no hub
const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL ?? APP_URL;

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FroptyHub</title></head>
<body style="margin:0;padding:0;background:#040316;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:32px auto;">
    <tr><td style="padding:0 24px 32px;">
      <!-- Logo -->
      <div style="margin-bottom:28px;">
        <span style="font-size:20px;font-weight:800;color:#F7F8FC;">Fropty<span style="color:#5B57E8;">Hub</span></span>
      </div>
      <!-- Card -->
      <div style="background:#110E67;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px 24px;">
        ${content}
      </div>
      <!-- Footer -->
      <p style="font-size:11px;color:#334155;text-align:center;margin-top:20px;">
        FroptyHub · <a href="${APP_URL}" style="color:#5B57E8;text-decoration:none;">fropty.com</a>
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

// Escapa conteúdo fornecido pelo usuário antes de injetar no HTML do e-mail
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Boas-vindas ao novo cliente ───────────────────────────────────
export async function sendWelcomeEmail(opts: {
  toEmail: string;
  toName: string;
  plan: string;
  tokenBalance: number;
}) {
  const planLabel: Record<string, string> = {
    sem_plano: "Sem plano",
    basico:    "Básico",
    pro:       "Pro",
  };
  const plan = planLabel[opts.plan] ?? "Sem plano";
  const hasPlan = opts.plan !== "sem_plano";

  await getResend()?.emails.send({
    from: FROM,
    to:   opts.toEmail,
    subject: `Sua conta está pronta, ${opts.toName.split(" ")[0]}!`,
    html: baseTemplate(`
      <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">Bem-vindo à FroptyHub</p>
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#F7F8FC;line-height:1.3;">
        Que bom ter você com a gente, ${opts.toName.split(" ")[0]}!
      </h2>
      <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0 0 20px;">
        Sua senha foi criada e sua conta está pronta para usar. Ficamos muito felizes que você tenha escolhido a FroptyHub.
      </p>

      <!-- Resumo da conta -->
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px 20px;margin-bottom:20px;">
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Sua conta</p>
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#94a3b8;">Plano</td>
            <td style="padding:6px 0;font-size:13px;font-weight:700;color:#F7F8FC;text-align:right;">
              ${hasPlan
                ? `<span style="background:#5B57E822;color:#5B57E8;border:1px solid #5B57E830;padding:2px 10px;border-radius:999px;">${plan}</span>`
                : `<span style="color:#475569;">${plan}</span>`
              }
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#94a3b8;border-top:1px solid rgba(255,255,255,0.06);">Tokens disponíveis</td>
            <td style="padding:6px 0;font-size:13px;font-weight:700;color:#EF9F27;text-align:right;border-top:1px solid rgba(255,255,255,0.06);">
              ${opts.tokenBalance} token${opts.tokenBalance !== 1 ? "s" : ""}
            </td>
          </tr>
        </table>
      </div>

      <p style="font-size:13px;color:#94a3b8;line-height:1.7;margin:0 0 4px;">
        Acesse o portal para acompanhar seus serviços, abrir chamados de suporte e muito mais. Qualquer dúvida, estamos aqui.
      </p>
      ${btn("Acessar meu portal", `${HUB_URL}/portal/dashboard`)}
    `),
  }).catch((e) => console.error("[email] sendWelcomeEmail:", e));
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

  await getResend()?.emails.send({
    from: FROM,
    to:   adminEmail,
    subject: `[Novo chamado] ${opts.subject}`,
    html: baseTemplate(`
      <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;">Novo chamado aberto</p>
      <h2 style="margin:0 0 16px;font-size:18px;font-weight:800;color:#F7F8FC;">${esc(opts.subject)}</h2>
      ${tag(esc(opts.category))}
      <div style="margin-top:16px;font-size:13px;color:#94a3b8;line-height:1.6;">
        <p style="margin:4px 0;"><strong style="color:#F7F8FC;">Cliente:</strong> ${esc(opts.clientName)}</p>
        <p style="margin:4px 0;"><strong style="color:#F7F8FC;">E-mail:</strong> ${esc(opts.clientEmail)}</p>
      </div>
      ${btn("Abrir chamado", `${HUB_URL}/admin/suporte/${opts.ticketId}`)}
    `),
  }).catch((e) => console.error("[email] sendNewTicketAlert:", e));
}

// ── Confirmação de chamado aberto (para o cliente) ────────────────
export async function sendTicketOpenedToClient(opts: {
  toEmail: string;
  toName: string;
  subject: string;
  category: string;
  priority: "baixa" | "media" | "alta";
  body: string;
  ticketNumber?: number;
  ticketId: string;
}) {
  if (!opts.toEmail) return;

  const priorityLabel: Record<string, string> = { baixa: "Baixa", media: "Média", alta: "Alta" };
  const priorityColor: Record<string, string> = { baixa: "#94a3b8", media: "#EF9F27", alta: "#ef4444" };
  const ref = opts.ticketNumber ? `UFT${String(opts.ticketNumber).padStart(4, "0")}` : null;

  await getResend()?.emails.send({
    from: FROM,
    to:   opts.toEmail,
    subject: `Chamado recebido${ref ? ` (${ref})` : ""}: ${opts.subject}`,
    html: baseTemplate(`
      <p style="margin:0 0 6px;font-size:13px;color:#22c55e;">&#10003; Recebemos seu chamado</p>
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#F7F8FC;line-height:1.3;">${escapeHtml(opts.subject)}</h2>
      ${ref ? `<p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#5B57E8;letter-spacing:0.05em;">${ref}</p>` : ""}
      <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0 0 20px;">
        Olá, <strong style="color:#F7F8FC;">${escapeHtml(opts.toName.split(" ")[0])}</strong>! Recebemos seu chamado e nossa equipe já está de olho. Você será avisado por aqui a cada atualização.
      </p>

      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px 20px;margin-bottom:20px;">
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Resumo do chamado</p>
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#94a3b8;">Categoria</td>
            <td style="padding:6px 0;font-size:13px;font-weight:700;color:#F7F8FC;text-align:right;">${escapeHtml(opts.category)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#94a3b8;border-top:1px solid rgba(255,255,255,0.06);">Prioridade</td>
            <td style="padding:6px 0;font-size:13px;font-weight:700;text-align:right;border-top:1px solid rgba(255,255,255,0.06);">
              <span style="color:${priorityColor[opts.priority]};">${priorityLabel[opts.priority]}</span>
            </td>
          </tr>
        </table>
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">O que você pediu</p>
          <p style="margin:0;font-size:13px;color:#cbd5e1;line-height:1.7;white-space:pre-wrap;">${escapeHtml(opts.body).slice(0, 600)}${opts.body.length > 600 ? "…" : ""}</p>
        </div>
      </div>

      <p style="font-size:13px;color:#94a3b8;line-height:1.7;margin:0;">
        Acompanhe e responda diretamente pelo portal.
      </p>
      ${btn("Ver meu chamado", `${HUB_URL}/portal/suporte/${opts.ticketId}`)}
    `),
  }).catch((e) => console.error("[email] sendTicketOpenedToClient:", e));
}

// ── Mudança de status do chamado (para o cliente) ─────────────────
export async function sendTicketStatusChange(opts: {
  toEmail: string;
  toName: string;
  subject: string;
  oldStatus: string;
  newStatus: string;
  ticketNumber?: number;
  ticketId: string;
  note?: string;
}) {
  if (!opts.toEmail) return;

  const statusInfo: Record<string, { label: string; color: string; msg: string }> = {
    aberto:       { label: "Aberto",       color: "#3b82f6", msg: "Seu chamado foi reaberto e está na nossa fila." },
    em_andamento: { label: "Em andamento", color: "#EF9F27", msg: "Já estamos trabalhando no seu chamado." },
    resolvido:    { label: "Aguardando validação", color: "#22c55e", msg: "Marcamos seu chamado como resolvido. Confirme se a solução atendeu para encerrarmos." },
    fechado:      { label: "Fechado",      color: "#94a3b8", msg: "Seu chamado foi encerrado. Obrigado pelo contato!" },
    reaberto:     { label: "Reaberto",     color: "#a855f7", msg: "Recebemos seu retorno: o chamado foi reaberto e voltará para a fila do time." },
  };

  const info = statusInfo[opts.newStatus] ?? { label: opts.newStatus, color: "#5B57E8", msg: "O status do seu chamado foi atualizado." };
  const oldLabel = statusInfo[opts.oldStatus]?.label ?? opts.oldStatus;
  const ref = opts.ticketNumber ? `UFT${String(opts.ticketNumber).padStart(4, "0")}` : null;

  await getResend()?.emails.send({
    from: FROM,
    to:   opts.toEmail,
    subject: `Chamado ${info.label.toLowerCase()}${ref ? ` (${ref})` : ""}: ${opts.subject}`,
    html: baseTemplate(`
      <p style="margin:0 0 6px;font-size:13px;color:${info.color};">Atualização no seu chamado</p>
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#F7F8FC;line-height:1.3;">${escapeHtml(opts.subject)}</h2>
      ${ref ? `<p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#5B57E8;letter-spacing:0.05em;">${ref}</p>` : ""}
      <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0 0 20px;">
        Olá, <strong style="color:#F7F8FC;">${escapeHtml(opts.toName.split(" ")[0])}</strong>! ${info.msg}
      </p>

      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px 20px;margin-bottom:20px;text-align:center;">
        <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(148,163,184,0.12);color:#94a3b8;font-size:12px;font-weight:700;">${oldLabel}</span>
        <span style="display:inline-block;margin:0 10px;color:#475569;font-size:16px;">&rarr;</span>
        <span style="display:inline-block;padding:4px 14px;border-radius:999px;background:${info.color}22;color:${info.color};font-size:12px;font-weight:700;border:1px solid ${info.color}40;">${info.label}</span>
      </div>

      ${opts.note ? `<div style="background:rgba(255,255,255,0.05);border-left:3px solid #5B57E8;border-radius:4px;padding:12px 16px;margin:0 0 20px;"><p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Comentário da equipe</p><p style="margin:0;font-size:13px;color:#cbd5e1;line-height:1.6;white-space:pre-wrap;">${escapeHtml(opts.note.slice(0, 800))}</p></div>` : ""}

      ${btn("Ver meu chamado", `${HUB_URL}/portal/suporte/${opts.ticketId}`)}
    `),
  }).catch((e) => console.error("[email] sendTicketStatusChange:", e));
}

// ── Feedback do cliente sobre a resolução (para o time interno) ───
export async function sendResolutionFeedbackToTeam(opts: {
  approved: boolean;
  clientName: string;
  subject: string;
  ticketNumber?: number;
  ticketId: string;
  reason?: string;
}) {
  const adminEmail = process.env.CONTACT_EMAIL;
  if (!adminEmail) return;

  const ref = opts.ticketNumber ? `UFT${String(opts.ticketNumber).padStart(4, "0")}` : null;
  const titulo = opts.approved ? "Cliente aprovou a resolução" : "Cliente NÃO aprovou a resolução";
  const cor = opts.approved ? "#22c55e" : "#ef4444";

  await getResend()?.emails.send({
    from: FROM,
    to:   adminEmail,
    subject: `[${opts.approved ? "Aprovado" : "Reaberto"}] ${ref ? `${ref} · ` : ""}${opts.subject}`,
    html: baseTemplate(`
      <p style="margin:0 0 6px;font-size:13px;color:${cor};">${titulo}</p>
      <h2 style="margin:0 0 8px;font-size:18px;font-weight:800;color:#F7F8FC;">${esc(opts.subject)}</h2>
      ${ref ? `<p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#5B57E8;letter-spacing:0.05em;">${ref}</p>` : ""}
      <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin:0 0 8px;"><strong style="color:#F7F8FC;">Cliente:</strong> ${esc(opts.clientName)}</p>
      ${opts.approved
        ? `<p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0;">O chamado foi <strong style="color:#22c55e;">fechado</strong> com a confirmação do cliente.</p>`
        : `<p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0 0 8px;">O chamado voltou para o status <strong style="color:#a855f7;">Reaberto</strong>. Mova para "Em andamento" ao retomar.</p>
           ${opts.reason ? `<div style="background:rgba(255,255,255,0.05);border-left:3px solid #ef4444;border-radius:4px;padding:12px 16px;margin:12px 0 0;"><p style="margin:0;font-size:13px;color:#cbd5e1;font-style:italic;line-height:1.6;">${esc(opts.reason.slice(0, 400))}</p></div>` : ""}`
      }
      ${btn("Abrir chamado", `${HUB_URL}/admin/suporte/${opts.ticketId}`)}
    `),
  }).catch((e) => console.error("[email] sendResolutionFeedbackToTeam:", e));
}

// ── Nova mensagem no ticket (para o destinatário) ────────────────
export async function sendNewMessageAlert(opts: {
  toEmail: string;
  toName: string;
  fromName: string;
  senderRole: "cliente" | "admin";
  ticketSubject: string;
  ticketId: string;
  preview: string;
}) {
  const isClient = opts.senderRole !== "cliente";
  const destUrl = isClient
    ? `${HUB_URL}/portal/suporte/${opts.ticketId}`
    : `${HUB_URL}/admin/suporte/${opts.ticketId}`;

  await getResend()?.emails.send({
    from: FROM,
    to:   opts.toEmail,
    subject: `Nova resposta: ${opts.ticketSubject}`,
    html: baseTemplate(`
      <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;">${esc(opts.fromName)} respondeu seu chamado</p>
      <h2 style="margin:0 0 16px;font-size:18px;font-weight:800;color:#F7F8FC;">${esc(opts.ticketSubject)}</h2>
      <div style="background:rgba(255,255,255,0.05);border-left:3px solid #5B57E8;border-radius:4px;padding:12px 16px;margin:16px 0;">
        <p style="margin:0;font-size:13px;color:#cbd5e1;font-style:italic;line-height:1.6;">${esc(opts.preview.slice(0, 200))}${opts.preview.length > 200 ? "…" : ""}</p>
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
  await getResend()?.emails.send({
    from: FROM,
    to:   opts.toEmail,
    subject: "Seus tokens estão acabando — FroptyHub",
    html: baseTemplate(`
      <p style="margin:0 0 6px;font-size:13px;color:#EF9F27;">⚠ Atenção</p>
      <h2 style="margin:0 0 12px;font-size:18px;font-weight:800;color:#F7F8FC;">Seus tokens estão acabando</h2>
      <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0 0 8px;">
        Olá, <strong style="color:#F7F8FC;">${esc(opts.toName.split(" ")[0])}</strong>!
        Você tem apenas <strong style="color:#EF9F27;">${opts.balance} token${opts.balance !== 1 ? "s" : ""}</strong> disponível${opts.balance !== 1 ? "s" : ""}.
      </p>
      <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0;">
        Recarregue para continuar usando o suporte sem interrupções.
      </p>
      ${btn("Recarregar tokens", `${HUB_URL}/portal/financeiro`)}
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
  await getResend()?.emails.send({
    from: FROM,
    to:   opts.toEmail,
    subject: `Plano ${planLabel} ativado — FroptyHub`,
    html: baseTemplate(`
      <p style="margin:0 0 6px;font-size:13px;color:#22c55e;">✓ Confirmação</p>
      <h2 style="margin:0 0 12px;font-size:18px;font-weight:800;color:#F7F8FC;">Plano ${planLabel} ativado!</h2>
      <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0 0 16px;">
        Olá, <strong style="color:#F7F8FC;">${esc(opts.toName.split(" ")[0])}</strong>!
        Seu plano foi ativado com sucesso e <strong style="color:#5B57E8;">${opts.tokens} tokens</strong> foram creditados na sua conta.
      </p>
      ${btn("Acessar minha conta", `${HUB_URL}/portal/dashboard`)}
    `),
  }).catch((e) => console.error("[email] sendPlanConfirmation:", e));
}
