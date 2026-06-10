function PhoneStatusBar() {
  return (
    <div className="relative flex h-7 items-center justify-between bg-neutral-900 px-4">
      <span className="relative z-10 text-[11px] font-semibold text-neutral-200">9:41</span>
      {/* Dynamic Island pill */}
      <div className="absolute left-1/2 top-1.5 h-3 w-10 -translate-x-1/2 rounded-full bg-neutral-950" />
      <div className="relative z-10 flex items-center gap-1.5 text-neutral-400">
        {/* Signal bars */}
        <svg width="11" height="8" fill="currentColor" viewBox="0 0 11 8">
          <rect x="0" y="5" width="2" height="3" rx="0.4" opacity="0.5" />
          <rect x="3" y="3" width="2" height="5" rx="0.4" opacity="0.7" />
          <rect x="6" y="1.5" width="2" height="6.5" rx="0.4" opacity="0.9" />
          <rect x="9" y="0" width="2" height="8" rx="0.4" />
        </svg>
        {/* Battery */}
        <svg width="15" height="8" fill="none" viewBox="0 0 15 8">
          <rect x="0.5" y="0.5" width="12" height="7" rx="2" stroke="currentColor" strokeOpacity="0.6" />
          <rect x="13" y="2.5" width="1.5" height="3" rx="0.5" fill="currentColor" fillOpacity="0.6" />
          <rect x="1.5" y="1.5" width="8" height="5" rx="1.5" fill="currentColor" fillOpacity="0.9" />
        </svg>
      </div>
    </div>
  );
}

const PHONE_CLS =
  "w-[220px] overflow-hidden rounded-[28px] border-2 border-neutral-700 bg-neutral-950 " +
  "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.04)]";

export default function AppDemos() {
  const orders = [
    { name: "Marcos Silva",  plate: "BRA-2A49", service: "Troca de óleo",      delay: "0s"   },
    { name: "Fernanda Costa", plate: "MG-3F78",  service: "Revisão geral",      delay: "-3s"  },
    { name: "Carlos Mota",   plate: "SP-5J12",  service: "Freios dianteiros",  delay: "-6s"  },
    { name: "Ricardo Gomes", plate: "RJ-7K01",  service: "Suspensão traseira", delay: "-2s"  },
  ];

  const statusBadges = [
    { anim: "demoStatus1", cls: "bg-orange-900/60 text-orange-400", label: "Em andamento" },
    { anim: "demoStatus2", cls: "bg-green-900/60 text-green-400",   label: "Concluído"    },
    { anim: "demoStatus3", cls: "bg-neutral-700/80 text-neutral-300", label: "Ag. peça"  },
  ];

  const appointments = [
    { day: "Seg 9h",  name: "Maria Santos", type: "Retorno",        statusCls: "bg-green-900/60 text-green-400",   label: "Confirmado", pulseDelay: "0s"   },
    { day: "Ter 10h", name: "João Lima",    type: "Consulta geral", statusCls: "bg-green-900/60 text-green-400",   label: "Confirmado", pulseDelay: "0.9s" },
    { day: "Qui 11h", name: "Ana Paula",    type: "Exame rotina",   statusCls: "bg-green-900/60 text-green-400",   label: "Confirmado", pulseDelay: "1.8s" },
    { day: "Sex 14h", name: "Pedro Rocha",  type: "Psicologia",     statusCls: "bg-yellow-900/60 text-yellow-500", label: "Aguardando", pulseDelay: undefined },
  ];

  const products = [
    { name: "Brigadeiro",    price: "R$ 3,50", bg: "linear-gradient(135deg,#5c2d0e,#7c3f00,#3d1a00)" },
    { name: "Coxinha",       price: "R$ 5,00", bg: "linear-gradient(135deg,#92400e,#d97706,#78350f)" },
    { name: "Brownie",       price: "R$ 7,00", bg: "linear-gradient(135deg,#1c0a00,#3d1a00,#78350f)" },
    { name: "Pastel Queijo", price: "R$ 4,00", bg: "linear-gradient(135deg,#854d0e,#ca8a04,#713f12)" },
  ];

  const cartNums = [
    { n: "0", anim: "demoCount0" },
    { n: "1", anim: "demoCount1" },
    { n: "2", anim: "demoCount2" },
    { n: "3", anim: "demoCount3" },
  ];

  return (
    <section id="exemplos" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-100 sm:text-4xl">
            Veja o que é possível
          </h2>
          <p className="mt-3 text-neutral-400">Apps reais para negócios reais.</p>
        </div>

        {/* Cards */}
        <div className="mt-16 flex flex-col items-center gap-14 md:flex-row md:items-start md:justify-center">

          {/* ══════════ APP 1 — OFICINA DO ZÉ ══════════ */}
          <div className="flex flex-col items-center gap-5">
            <div className={PHONE_CLS}>
              <PhoneStatusBar />

              <div className="bg-[#185FA5] px-4 py-2.5">
                <p className="text-xs font-bold text-white">🔧 Oficina do Zé</p>
                <p className="mt-0.5 text-[10px] text-blue-200">Ordens de Serviço</p>
              </div>

              <div className="flex items-center justify-between bg-neutral-900/70 px-4 py-1.5">
                <span className="text-[9px] text-neutral-500">Hoje · 4 abertas</span>
                <span className="text-[9px] text-[#4D9BE0]">+ Nova OS</span>
              </div>

              <div className="divide-y divide-neutral-800/60 bg-neutral-950">
                {orders.map((o) => (
                  <div key={o.name} className="flex items-center justify-between px-3 py-2.5">
                    <div>
                      <p className="text-[11px] font-semibold text-neutral-100">{o.name}</p>
                      <p className="mt-0.5 text-[9px] text-neutral-500">
                        {o.plate} · {o.service}
                      </p>
                    </div>
                    <div className="relative h-[18px] w-[78px]">
                      {statusBadges.map((s) => (
                        <span
                          key={s.label}
                          className={`absolute inset-0 flex items-center justify-center rounded-full text-[8px] font-semibold leading-none ${s.cls}`}
                          style={{
                            animation: `${s.anim} 9s linear infinite`,
                            animationDelay: o.delay,
                          }}
                        >
                          {s.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between bg-neutral-900/50 px-4 py-2">
                <span className="text-[9px] text-neutral-600">Atualizado agora</span>
                <span className="text-[9px] text-[#4D9BE0]">Ver histórico →</span>
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-neutral-100">Oficina do Zé</h3>
              <p className="mt-0.5 text-sm text-neutral-500">Gestão de ordens de serviço</p>
            </div>
          </div>

          {/* ══════════ APP 2 — CONSULTÓRIO DRA. ANA ══════════ */}
          <div className="flex flex-col items-center gap-5">
            <div className={PHONE_CLS}>
              <PhoneStatusBar />

              <div className="bg-[#0c3d2e] px-4 py-2.5">
                <p className="text-xs font-bold text-white">🏥 Consultório Dra. Ana</p>
                <p className="mt-0.5 text-[10px] text-emerald-400">09/06 – 13/06</p>
              </div>

              <div className="flex items-center justify-between bg-neutral-900/70 px-4 py-1.5">
                <span className="text-[9px] text-neutral-500">‹ Anterior</span>
                <span className="text-[9px] font-medium text-neutral-300">Semana atual</span>
                <span className="text-[9px] text-neutral-500">Próxima ›</span>
              </div>

              <div className="divide-y divide-neutral-800/60 bg-neutral-950">
                {appointments.map((appt) => (
                  <div key={appt.name} className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-9 text-[9px] font-medium text-emerald-500">{appt.day}</span>
                      <div>
                        <p className="text-[10px] font-semibold text-neutral-100">{appt.name}</p>
                        <p className="text-[9px] text-neutral-500">{appt.type}</p>
                      </div>
                    </div>
                    <span
                      className={`whitespace-nowrap rounded-full px-1.5 py-0.5 text-[7px] font-semibold ${appt.statusCls}`}
                      style={
                        appt.pulseDelay
                          ? { animation: "demoBadgePulse 2.5s ease-in-out infinite", animationDelay: appt.pulseDelay }
                          : undefined
                      }
                    >
                      {appt.label}
                    </span>
                  </div>
                ))}

                {/* Animated slot — cycles between empty and booked */}
                <div className="relative h-[38px]">
                  <div
                    className="absolute inset-0 flex items-center px-3"
                    style={{ animation: "demoSlotEmpty 12s ease-in-out infinite", animationDelay: "1.5s" }}
                  >
                    <span className="w-9 text-[9px] font-medium text-neutral-600">Qua 15h</span>
                    <p className="ml-2 text-[10px] text-neutral-700">— Disponível —</p>
                  </div>
                  <div
                    className="absolute inset-0 flex items-center justify-between px-3"
                    style={{ animation: "demoSlotBooked 12s ease-in-out infinite", animationDelay: "1.5s" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-9 text-[9px] font-medium text-[#EF9F27]">Qua 15h</span>
                      <div>
                        <p className="text-[10px] font-semibold text-neutral-100">Lucas Ferreira</p>
                        <p className="text-[9px] text-neutral-500">Primeira consulta</p>
                      </div>
                    </div>
                    <span className="whitespace-nowrap rounded-full bg-orange-900/60 px-1.5 py-0.5 text-[7px] font-semibold text-[#EF9F27]">
                      Pendente
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center bg-neutral-900/50 px-4 py-2">
                <span className="text-[9px] text-[#4D9BE0]">+ Agendar nova consulta</span>
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-neutral-100">Consultório Dra. Ana</h3>
              <p className="mt-0.5 text-sm text-neutral-500">Agendamento de consultas</p>
            </div>
          </div>

          {/* ══════════ APP 3 — DOCES DA CAROL ══════════ */}
          <div className="flex flex-col items-center gap-5">
            <div className={PHONE_CLS}>
              <PhoneStatusBar />

              <div className="flex items-center justify-between bg-[#7c1d1d] px-4 py-2.5">
                <div>
                  <p className="text-xs font-bold text-white">🍬 Doces da Carol</p>
                  <p className="mt-0.5 text-[10px] text-rose-300">Encomendas & Catálogo</p>
                </div>
                {/* Cart with animated counter */}
                <div className="relative">
                  <span className="text-xl leading-none">🛒</span>
                  <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF9F27]">
                    <div className="relative h-3 w-3 overflow-hidden">
                      {cartNums.map(({ n, anim }) => (
                        <span
                          key={n}
                          className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white"
                          style={{ animation: `${anim} 8s linear infinite`, animationDelay: "3s" }}
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 bg-neutral-900/70 px-3 py-1.5">
                <span className="rounded-full bg-[#185FA5] px-2 py-0.5 text-[8px] font-semibold text-white">Doces</span>
                <span className="py-0.5 text-[8px] text-neutral-500">Salgados</span>
                <span className="py-0.5 text-[8px] text-neutral-500">Bebidas</span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-2.5">
                {products.map((p) => (
                  <div key={p.name} className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
                    <div className="h-[58px]" style={{ background: p.bg }} />
                    <div className="p-1.5">
                      <p className="text-[9px] font-semibold leading-tight text-neutral-100">{p.name}</p>
                      <p className="text-[9px] font-bold text-[#EF9F27]">{p.price}</p>
                      <button className="mt-1 w-full rounded-lg bg-[#185FA5] py-0.5 text-[8px] font-bold text-white">
                        + Carrinho
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center bg-neutral-900/50 px-4 py-2">
                <span className="text-[9px] text-[#4D9BE0]">Ver cardápio completo →</span>
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-neutral-100">Doces da Carol</h3>
              <p className="mt-0.5 text-sm text-neutral-500">Catálogo e pedidos online</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
