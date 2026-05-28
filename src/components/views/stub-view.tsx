interface Props {
  title: string;
  subtitle?: string;
  description?: string;
  source: string;
}

export function StubView({ title, subtitle, description, source }: Props) {
  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">VIEW STUB</div>
          <h1 className="view-title">{title}</h1>
          {subtitle && <p className="view-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Not yet implemented</h3>
        </div>
        <div className="card-body">
          <p style={{ marginTop: 0, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {description ?? "This view is scaffolded with the right route and shell. The original prototype is in "}
            <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{source}</code>
            {description ? null : "."}
          </p>
          <p style={{ color: "var(--text-tertiary)", fontSize: 12.5, lineHeight: 1.5 }}>
            Port the JSX into a Server Component under <code>src/components/views/</code>,
            replacing the prototype's mock data with Drizzle queries from <code>src/server/db</code>.
            Wire mutations through Server Actions in <code>src/server/actions</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
