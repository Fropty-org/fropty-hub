import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import crypto from "crypto";

export const runtime = "nodejs";

function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac("sha1", secret).update(body).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function findProjectId(projectName: string, projects: { id: string; name: string }[]): string | null {
  const normalized = projectName.toLowerCase().replace(/[-_]/g, " ");
  const match = projects.find((p) =>
    p.name.toLowerCase().replace(/[-_]/g, " ").includes(normalized) ||
    normalized.includes(p.name.toLowerCase().replace(/[-_]/g, " "))
  );
  return match?.id ?? null;
}

const DEPLOYMENT_STATE_LABEL: Record<string, string> = {
  BUILDING:  "Em build",
  ERROR:     "Falhou",
  CANCELED:  "Cancelado",
  READY:     "Deploy concluído",
};

export async function POST(req: NextRequest) {
  const secret = process.env.VERCEL_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const body      = await req.text();
  const signature = req.headers.get("x-vercel-signature");

  if (!verifySignature(body, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType  = payload.type as string ?? "unknown";
  const deployment = payload.payload as Record<string, unknown> ?? {};
  const meta       = deployment.meta as Record<string, string> ?? {};
  const projectName = meta.githubRepoSlug ?? (deployment.project as Record<string, string>)?.name ?? "";
  const state      = (deployment.deployment as Record<string, string>)?.state ?? deployment.state as string ?? "";
  const url        = (deployment.deployment as Record<string, string>)?.url
    ? `https://${(deployment.deployment as Record<string, string>).url}` : null;

  const supabase  = createServiceClient();
  const { data: projects } = await supabase.from("projects").select("id, name");
  const projectId = findProjectId(projectName, projects ?? []);

  const stateLabel = DEPLOYMENT_STATE_LABEL[state] ?? state;
  const title      = `Deploy ${stateLabel} — ${projectName || "projeto"}`;
  const actor      = meta.githubCommitAuthorName ?? null;
  const bodyText   = meta.githubCommitMessage ?? null;

  if (projectId) {
    await supabase.from("project_events").insert({
      project_id: projectId,
      source:     "vercel" as const,
      event_type: eventType,
      title,
      body:       bodyText,
      url,
      actor,
      metadata:   payload as Record<string, unknown>,
    });
  }

  return NextResponse.json({ received: true });
}
