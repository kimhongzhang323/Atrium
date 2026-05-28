type Tone = "neutral" | "success" | "warn" | "danger" | "info" | "purple";

interface Props {
  tone?: Tone;
  dot?: boolean;
  children: React.ReactNode;
}

export function Pill({ tone = "neutral", dot, children }: Props) {
  return (
    <span className={`pill ${tone}`}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}
