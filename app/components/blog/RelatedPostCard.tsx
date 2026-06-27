"use client";

import Link from "next/link";
import type { BlogPost } from "../../lib/blog/posts";
import { ArrowRight } from "lucide-react";

export function RelatedPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: 14,
          padding: "18px 20px",
          transition: "border-color 0.2s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-hover)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--card-border)"; }}
      >
        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--primary)" }}>
          {post.category}
        </span>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "8px 0 6px", color: "var(--text)" }}>{post.title}</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 10px", lineHeight: 1.5 }}>
          {post.description.slice(0, 80)}…
        </p>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 4 }}>
          Ler <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}
