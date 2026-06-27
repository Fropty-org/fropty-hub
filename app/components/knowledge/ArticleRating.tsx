"use client";

import { useState, useTransition } from "react";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { rateArticle } from "@/app/actions/knowledge";

export function ArticleRating({ articleId }: { articleId: string }) {
  const [voted, setVoted]     = useState<"yes" | "no" | null>(null);
  const [pending, startTransition] = useTransition();

  function handleVote(helpful: boolean) {
    if (voted) return;
    startTransition(async () => {
      await rateArticle(articleId, helpful);
      setVoted(helpful ? "yes" : "no");
    });
  }

  if (voted) {
    return (
      <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
        Obrigado pelo seu feedback!
      </p>
    );
  }

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button
        onClick={() => handleVote(true)}
        disabled={pending}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "8px 16px", borderRadius: 8,
          border: "1px solid var(--border)", background: "var(--surface)",
          cursor: pending ? "not-allowed" : "pointer",
          fontSize: "0.85rem", fontWeight: 600,
          color: "var(--text-muted)",
          opacity: pending ? 0.6 : 1,
          fontFamily: "inherit",
          transition: "border-color 0.15s, color 0.15s",
        }}
      >
        {pending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <ThumbsUp size={14} />}
        Sim
      </button>
      <button
        onClick={() => handleVote(false)}
        disabled={pending}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "8px 16px", borderRadius: 8,
          border: "1px solid var(--border)", background: "var(--surface)",
          cursor: pending ? "not-allowed" : "pointer",
          fontSize: "0.85rem", fontWeight: 600,
          color: "var(--text-muted)",
          opacity: pending ? 0.6 : 1,
          fontFamily: "inherit",
          transition: "border-color 0.15s, color 0.15s",
        }}
      >
        {pending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <ThumbsDown size={14} />}
        Não
      </button>
    </div>
  );
}
