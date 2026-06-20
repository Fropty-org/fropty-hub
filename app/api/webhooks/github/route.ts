import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import crypto from "crypto";

export const runtime = "nodejs";

function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(body).digest("hex")}`;
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function findProjectId(repoName: string, projects: { id: string; name: string }[]): string | null {
  // Tenta encontrar o projeto pelo nome do repositório (case-insensitive)
  const normalized = repoName.toLowerCase().replace(/[-_]/g, " ");
  const match = projects.find((p) =>
    p.name.toLowerCase().replace(/[-_]/g, " ").includes(normalized) ||
    normalized.includes(p.name.toLowerCase().replace(/[-_]/g, " "))
  );
  return match?.id ?? null;
}

export async function POST(req: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const body      = await req.text();
  const signature = req.headers.get("x-hub-signature-256");
  const eventType = req.headers.get("x-github-event") ?? "unknown";

  if (!verifySignature(body, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase   = createServiceClient();
  const { data: projects } = await supabase.from("projects").select("id, name");

  const repoName   = (payload.repository as Record<string, unknown>)?.name as string ?? "";
  const projectId  = findProjectId(repoName, projects ?? []);

  // Extrai informações relevantes por tipo de evento
  let title = `[GitHub] ${eventType}`;
  let bodyText: string | null = null;
  let url: string | null = null;
  let actor: string | null = null;

  if (eventType === "push") {
    const commits = (payload.commits as unknown[]) ?? [];
    const ref = (payload.ref as string ?? "").replace("refs/heads/", "");
    title = `Push em ${ref} (${commits.length} commit${commits.length !== 1 ? "s" : ""})`;
    const lastCommit = commits[commits.length - 1] as Record<string, unknown> | undefined;
    bodyText = lastCommit?.message as string ?? null;
    url      = lastCommit?.url as string ?? null;
    actor    = (payload.pusher as Record<string, string>)?.name ?? null;
  } else if (eventType === "pull_request") {
    const pr = payload.pull_request as Record<string, unknown>;
    const action = payload.action as string;
    title    = `PR #${pr.number}: ${pr.title} [${action}]`;
    bodyText = pr.body as string | null;
    url      = pr.html_url as string | null;
    actor    = (pr.user as Record<string, string>)?.login ?? null;
  } else if (eventType === "issues") {
    const issue  = payload.issue as Record<string, unknown>;
    const action = payload.action as string;
    title    = `Issue #${issue.number}: ${issue.title} [${action}]`;
    bodyText = issue.body as string | null;
    url      = issue.html_url as string | null;
    actor    = (issue.user as Record<string, string>)?.login ?? null;
  }

  if (projectId) {
    await supabase.from("project_events").insert({
      project_id: projectId,
      source:     "github" as const,
      event_type: eventType,
      title,
      body:       bodyText,
      url,
      actor,
      metadata:   payload as Record<string, unknown>,
    });
  }

  return NextResponse.json({ received: true, projectId });
}
