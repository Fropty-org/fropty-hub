"use client";

import { useState } from "react";

const priorities = [
  "Visual bonito",
  "Rapidez na entrega",
  "Preço baixo",
  "Funcionalidades completas",
  "Facilidade de uso",
];

export default function QuoteForm() {
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      nome: data.get("nome"),
      email: data.get("email"),
      ideia: data.get("ideia"),
      temLogo: data.get("temLogo"),
      cores: data.get("cores"),
      prioridades: data.getAll("prioridades"),
    };

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Falha no envio");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-6 rounded-2xl border border-green-800/50 bg-green-900/20 p-8 text-center">
        <i className="ti ti-circle-check" style={{ fontSize: "48px", color: "#4ade80" }} />
        <h3 className="mt-3 text-xl font-semibold text-green-400">
          Pedido enviado!
        </h3>
        <p className="mt-2 text-green-500">
          Recebemos sua ideia e vamos responder em breve com sua prévia
          gratuita.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-slate-300">
          Seu nome
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          className="mt-1 w-full rounded-lg border border-white/20 bg-[#0A093F] px-4 py-2 text-white placeholder-slate-500 transition duration-150 focus:border-[#5B57E8] focus:outline-none focus:ring-2 focus:ring-[#5B57E8]/25 focus:shadow-[0_0_0_4px_rgba(91,87,232,0.12)]"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300">
          Seu email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-white/20 bg-[#0A093F] px-4 py-2 text-white placeholder-slate-500 transition duration-150 focus:border-[#5B57E8] focus:outline-none focus:ring-2 focus:ring-[#5B57E8]/25 focus:shadow-[0_0_0_4px_rgba(91,87,232,0.12)]"
        />
      </div>

      <div>
        <label htmlFor="ideia" className="block text-sm font-medium text-slate-300">
          Qual é a ideia do seu app?
        </label>
        <textarea
          id="ideia"
          name="ideia"
          required
          rows={4}
          className="mt-1 w-full rounded-lg border border-white/20 bg-[#0A093F] px-4 py-2 text-white placeholder-slate-500 transition duration-150 focus:border-[#5B57E8] focus:outline-none focus:ring-2 focus:ring-[#5B57E8]/25 focus:shadow-[0_0_0_4px_rgba(91,87,232,0.12)]"
        />
      </div>

      <div>
        <label htmlFor="temLogo" className="block text-sm font-medium text-slate-300">
          Você já tem um logo?
        </label>
        <select
          id="temLogo"
          name="temLogo"
          required
          defaultValue=""
          className="mt-1 w-full rounded-lg border border-white/20 bg-[#0A093F] px-4 py-2 text-white focus:border-[#5B57E8] focus:outline-none focus:ring-2 focus:ring-[#5B57E8]/30"
        >
          <option value="" disabled className="text-slate-500">
            Selecione uma opção
          </option>
          <option value="sim" className="text-white bg-[#0A093F]">Sim, já tenho</option>
          <option value="nao" className="text-white bg-[#0A093F]">Não, preciso de um</option>
          <option value="em-andamento" className="text-white bg-[#0A093F]">Estou criando</option>
        </select>
      </div>

      <div>
        <label htmlFor="cores" className="block text-sm font-medium text-slate-300">
          Cores ou tema preferido
        </label>
        <input
          id="cores"
          name="cores"
          type="text"
          className="mt-1 w-full rounded-lg border border-white/20 bg-[#0A093F] px-4 py-2 text-white placeholder-slate-500 transition duration-150 focus:border-[#5B57E8] focus:outline-none focus:ring-2 focus:ring-[#5B57E8]/25 focus:shadow-[0_0_0_4px_rgba(91,87,232,0.12)]"
          placeholder="Ex: azul e branco, tema escuro, moderno..."
        />
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-slate-300">
          O que importa mais para você?
        </legend>
        <div className="mt-2 space-y-2">
          {priorities.map((p) => (
            <label key={p} className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                name="prioridades"
                value={p}
                className="h-4 w-4 rounded border-white/20 accent-[#5B57E8]"
              />
              {p}
            </label>
          ))}
        </div>
      </fieldset>

      {status === "error" && (
        <p className="rounded-lg bg-red-900/20 p-3 text-sm text-red-400">
          Ops, algo deu errado ao enviar. Tente novamente em instantes.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-[#5B57E8] px-6 py-3 font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {status === "sending" ? "Enviando..." : "Enviar pedido de orçamento"}
      </button>
    </form>
  );
}
