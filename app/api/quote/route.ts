import { NextRequest, NextResponse } from "next/server";
import { submitQuote } from "@/app/actions/submitQuote";

// Simple in-process rate limiter: max 5 requests per IP per 60s
// (resets on cold start — acceptable for serverless)
const rateMap = new Map<string, { count: number; reset: number }>();

function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (!checkRate(ip)) {
    return NextResponse.json(
      { error: "Muitas requisições. Aguarde um momento e tente novamente." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  // Honeypot: bots fill this hidden field
  if (body.website) {
    return NextResponse.json({ ok: true }); // silent reject
  }

  const result = await submitQuote({
    nome: body.nome as string,
    email: body.email as string,
    ideia: body.ideia as string,
    temLogo: body.temLogo as string | undefined,
    cores: body.cores as string | undefined,
    prioridades: body.prioridades as string[] | undefined,
  });

  if (!result.ok) {
    const status =
      result.error.includes("obrigatórios") || result.error.includes("inválido")
        ? 400
        : 502;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
