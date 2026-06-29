// Catálogo de serviços/módulos do ecossistema Fropty que um cliente pode contratar.
// A Fropty (Intelligent Software Ecosystem) vende estes módulos; a FroptyApps é
// o catálogo de micro-SaaS, apps mobile e dashboards de onde os clientes escolhem.
// O `id` é o que fica gravado em profiles.services (text[]).

import { LayoutGrid, CandlestickChart, Wallet, Rocket, ShieldCheck, type LucideIcon } from "lucide-react";

export interface FroptyService {
  id: string;
  label: string;
  /** @deprecated Use Icon instead */
  icon: string;
  Icon: LucideIcon;
  color: string;
}

export const SERVICES: FroptyService[] = [
  { id: "froptyapps",     label: "Fropty Apps",     icon: "ti-apps",         Icon: LayoutGrid,         color: "#5e54d1" },
  { id: "froptyinvest",   label: "Fropty Invest",   icon: "ti-chart-candle", Icon: CandlestickChart,   color: "#3b82f6" },
  { id: "froptycash",     label: "Fropty Cash",     icon: "ti-wallet",       Icon: Wallet,             color: "#22c55e" },
  { id: "froptyboost",    label: "Fropty Boost",    icon: "ti-rocket",       Icon: Rocket,             color: "#f97316" },
  { id: "froptysentinel", label: "Fropty Sentinel", icon: "ti-shield-lock",  Icon: ShieldCheck,        color: "#ef4444" },
];

export const SERVICE_IDS = SERVICES.map((s) => s.id);

const SERVICE_MAP = new Map(SERVICES.map((s) => [s.id, s]));

export function getService(id: string): FroptyService | undefined {
  return SERVICE_MAP.get(id);
}

/** Filtra/normaliza uma lista de ids, mantendo apenas os válidos. */
export function sanitizeServiceIds(ids: string[]): string[] {
  return ids.filter((id) => SERVICE_MAP.has(id));
}
