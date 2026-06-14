"use client";

import { useState } from "react";
import type { Faq } from "../lib/data/plans";

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="mt-10 divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#110E67]">
      {faqs.map((faq, i) => (
        <div key={faq.q}>
          <button
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="flex w-full items-center justify-between px-6 py-5 text-left font-medium text-slate-100 hover:bg-white/5 transition"
          >
            {faq.q}
            <span className="ml-4 text-slate-500">{openFaq === i ? "−" : "+"}</span>
          </button>
          {openFaq === i && (
            <p className="px-6 pb-5 text-sm leading-relaxed text-slate-400">{faq.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
