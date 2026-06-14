"use client";

import { useState } from "react";
import type { Faq } from "../lib/data/plans";

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="mt-10 divide-y rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card-bg)" }}>
      {faqs.map((faq, i) => (
        <div key={faq.q} style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="flex w-full items-center justify-between px-6 py-5 text-left font-medium transition"
            style={{ color: "var(--text)" }}
          >
            <span>{faq.q}</span>
            <span
              className="ml-4 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition"
              style={{
                background: openFaq === i ? "var(--primary)" : "var(--surface-2, var(--surface))",
                color: openFaq === i ? "#fff" : "var(--text-faint)",
                border: "1px solid var(--border)",
              }}
            >
              {openFaq === i ? "−" : "+"}
            </span>
          </button>
          {openFaq === i && (
            <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{faq.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
