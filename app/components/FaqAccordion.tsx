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
            {faq.q}
            <span className="ml-4" style={{ color: "var(--text-faint)" }}>{openFaq === i ? "−" : "+"}</span>
          </button>
          {openFaq === i && (
            <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{faq.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
