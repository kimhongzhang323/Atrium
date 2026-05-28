interface Props {
  label: string;
  value: string;
  delta?: string;
  deltaDir?: "up" | "down";
  spark?: ReadonlyArray<number>;
  sparkColor?: string;
}

export function KPI({ label, value, delta, deltaDir, spark, sparkColor }: Props) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {delta && (
        <div className={`kpi-delta${deltaDir ? ` ${deltaDir}` : ""}`}>{delta}</div>
      )}
      {spark && spark.length > 0 && (
        <div className="kpi-mini-chart">
          <Sparkline data={spark} color={sparkColor ?? "var(--text)"} />
        </div>
      )}
    </div>
  );
}

function Sparkline({ data, color }: { data: ReadonlyArray<number>; color: string }) {
  const w = 200, h = 36, pad = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}
