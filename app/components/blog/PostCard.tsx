"use client";

import Link from "next/link";
import { Coins, Eye, Wrench } from "lucide-react";
import type { BlogPost } from "../../lib/blog/posts";
import { ArrowRight } from "lucide-react";

const COVER_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  "ti-coins": Coins,
  "ti-eye":   Eye,
  "ti-tools": Wrench,
};

export function PostCard({ post }: { post: BlogPost }) {
  const Icon = COVER_ICONS[post.coverIcon] ?? Coins;

  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
      <article
        className="card-hover"
        style={{
          background:   "var(--card-bg)",
          border:       "1px solid var(--card-border)",
          borderRadius: 18,
          padding:      "28px",
          display:      "flex",
          gap:          20,
          alignItems:   "flex-start",
          cursor:       "pointer",
        }}
      >
        <div
          style={{
            width:           52,
            height:          52,
            borderRadius:    14,
            background:      `${post.coverColor}22`,
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            flexShrink:      0,
          }}
        >
          <Icon size={26} style={{ color: post.coverColor }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--primary)" }}>
              {post.category}
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>·</span>
            <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>
              {new Date(post.date).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>·</span>
            <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>{post.readTime} min de leitura</span>
          </div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>{post.title}</h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 12px" }}>
            {post.description}
          </p>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 4 }}>
            Ler artigo <ArrowRight size={13} />
          </span>
        </div>
      </article>
    </Link>
  );
}
