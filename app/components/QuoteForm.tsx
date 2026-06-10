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
      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="text-4xl">🎉</div>
        <h3 className="mt-3 text-xl font-semibold text-green-800">
          Pedido enviado!
        </h3>
        <p className="mt-2 text-green-700">
          Recebemos sua ideia e vamos responder em breve com sua prévia
          gratuita.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium">
          Seu nome
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-[#185FA5] focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30"
          placeholder="Como podemos te chamar?"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Seu email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-[#185FA5] focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30"
          placeholder="voce@exemplo.com"
        />
      </div>

      <div>
        <label htmlFor="ideia" className="block text-sm font-medium">
          Qual é a ideia do seu app?
        </label>
        <textarea
          id="ideia"
          name="ideia"
          required
          rows={4}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-[#185FA5] focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30"
          placeholder="Descreva com suas palavras o que o app deve fazer"
        />
      </div>

      <div>
        <label htmlFor="temLogo" className="block text-sm font-medium">
          Você já tem um logo?
        </label>
        <select
          id="temLogo"
          name="temLogo"
          required
          defaultValue=""
          className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 focus:border-[#185FA5] focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30"
        >
          <option value="" disabled>
            Selecione uma opção
          </option>
          <option value="sim">Sim, já tenho</option>
          <option value="nao">Não, preciso de um</option>
          <option value="em-andamento">Estou criando</option>
        </select>
      </div>

      <div>
        <label htmlFor="cores" className="block text-sm font-medium">
          Cores ou tema preferido
        </label>
        <input
          id="cores"
          name="cores"
          type="text"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-[#185FA5] focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30"
          placeholder="Ex: azul e branco, tema escuro, moderno..."
        />
      </div>

      <fieldset>
        <legend className="block text-sm font-medium">
          O que importa mais para você?
        </legend>
        <div className="mt-2 space-y-2">
          {priorities.map((p) => (
            <label key={p} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="prioridades"
                value={p}
                className="h-4 w-4 rounded border-neutral-300 accent-[#185FA5]"
              />
              {p}
            </label>
          ))}
        </div>
      </fieldset>

      {status === "error" && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Ops, algo deu errado ao enviar. Tente novamente em instantes.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-[#185FA5] px-6 py-3 font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {status === "sending" ? "Enviando..." : "Enviar pedido de orçamento"}
      </button>
    </form>
  );
}
