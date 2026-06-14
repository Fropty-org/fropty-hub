"use client";

import { useState } from "react";
import QuoteForm from "./QuoteForm";

export function QuoteButton({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className={className} style={style}>
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-8"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-xl rounded-2xl border border-white/10 p-8 shadow-2xl"
            style={{ background: "#181490" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Peça seu orçamento
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Conte sua ideia e a gente responde com uma prévia gratuita.
            </p>
            <QuoteForm />
          </div>
        </div>
      )}
    </>
  );
}
