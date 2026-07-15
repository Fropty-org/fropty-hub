/**
 * Pizza de progresso do SLA em SVG — escala de forma nítida e fica sempre
 * centralizada em qualquer nível de zoom do navegador (ao contrário do
 * conic-gradient com border/inset, que sofre arredondamento sub-pixel).
 *
 * Desenho: anel externo claro (mesma cor, opacidade baixa) + disco interno
 * cuja fatia preenchida representa a fração do prazo já decorrida.
 */
interface Props {
  /** Cor CSS do estado (ex.: "var(--c-danger)"). */
  color: string;
  /** 0..1 — fração decorrida do prazo ativo. */
  pct: number;
  size?: number;
  title?: string;
}

export function SlaGauge({ color, pct, size = 20, title }: Props) {
  const cx = 10, cy = 10, ring = 8.4, ir = 6;
  const p = Math.max(0, Math.min(1, pct));
  const a = p * 2 * Math.PI;
  const ex = cx + ir * Math.sin(a);
  const ey = cy - ir * Math.cos(a);
  const large = a > Math.PI ? 1 : 0;
  const pie = `M${cx} ${cy} L${cx} ${cy - ir} A${ir} ${ir} 0 ${large} 1 ${ex.toFixed(3)} ${ey.toFixed(3)} Z`;

  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: "block" }} role="img" aria-label={title}>
      {title ? <title>{title}</title> : null}
      <circle cx={cx} cy={cy} r={ring} fill="none" stroke={color} strokeOpacity={0.35} strokeWidth={1.7} />
      <circle cx={cx} cy={cy} r={ir} fill="var(--surface)" />
      {p >= 1
        ? <circle cx={cx} cy={cy} r={ir} fill={color} />
        : p > 0 ? <path d={pie} fill={color} /> : null}
    </svg>
  );
}
