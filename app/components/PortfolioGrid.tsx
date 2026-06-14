"use client";

import { useState } from "react";
import Link from "next/link";
import { PORTFOLIO, CATEGORIES, type Category } from "../lib/data/portfolio";

export function PortfolioGrid() {
  const [active, setActive] = useState<Category>("todos");

  const filtered = active === "todos"
    ? PORTFOLIO
    : PORTFOLIO.filter((p) => p.category === active);

  return (
    <section style={{ padding: "0 24px 60px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
          {CATEGORIES.map(({ id, label, icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 16px",
                  borderRadius: 999,
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  border: isActive ? "1px solid var(--primary)" : "1px solid var(--border)",
                  background: isActive ? "rgba(91,87,232,0.15)" : "var(--surface)",
                  color: isActive ? "var(--primary)" : "var(--text-muted)",
                }}
              >
                <i className={`ti ${icon}`} style={{ fontSize: 14 }} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {filtered.map((item) => (
            <div
              key={item.id}
              className="card-hover"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                borderRadius: 18,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                position: "relative",
              }}
            >
              {item.highlight && (
                <span
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    background: "rgba(91,87,232,0.2)",
                    color: "var(--primary)",
                    border: "1px solid rgba(91,87,232,0.3)",
                    borderRadius: 999,
                    padding: "2px 10px",
                  }}
                >
                  Destaque
                </span>
              )}

              {/* Icon */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: `${item.color}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i className={`ti ${item.icon}`} style={{ fontSize: 26, color: item.color }} />
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>
                  {item.description}
                </p>
              </div>

              {/* Tags */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: "var(--surface)",
                      color: "var(--text-faint)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Link
                href={`/configurador?ref=${item.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--primary)",
                  textDecoration: "none",
                  marginTop: 4,
                }}
              >
                Quero algo assim
                <i className="ti ti-arrow-right" style={{ fontSize: 13 }} />
              </Link>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-faint)" }}>
            <i className="ti ti-mood-empty" style={{ fontSize: 40, display: "block", marginBottom: 12 }} />
            <p style={{ margin: 0 }}>Nenhum projeto nesta categoria ainda.</p>
          </div>
        )}
      </div>
    </section>
  );
}
