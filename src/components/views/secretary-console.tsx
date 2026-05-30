import { KPI } from "@/components/ui/kpi";
import { Pill } from "@/components/ui/pill";

import { FileLinkForm } from "./file-link-form";

import type { listFileLinks } from "@/server/queries/files";

type FileRow = Awaited<ReturnType<typeof listFileLinks>>[number];

const CLASS_TONE = {
  public: "neutral",
  internal: "info",
  restricted: "warn",
  confidential: "danger",
} as const;

export function SecretaryConsole({ files }: { files: FileRow[] }) {
  const confidential = files.filter((f) => f.classification === "confidential").length;
  const restricted = files.filter((f) => f.classification === "restricted").length;

  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">SECRETARY · DOCUMENT CONTROL CENTER</div>
          <h1 className="view-title">Documents</h1>
          <p className="view-subtitle">
            {files.length} Drive-linked documents · governance by classification
          </p>
        </div>
        <FileLinkForm />
      </div>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <KPI label="Total documents" value={String(files.length)} />
        <KPI label="Restricted" value={String(restricted)} />
        <KPI label="Confidential" value={String(confidential)} />
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Document register</h3>
        </div>
        <div className="card-body tight">
          {files.length === 0 ? (
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              No documents linked yet.
            </p>
          ) : (
            files.map((f) => (
              <div className="row-item" key={f.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-title">{f.name}</div>
                  <div className="row-sub">
                    {f.driveMimeType}
                    {f.permissions.length > 0 ? ` · ${f.permissions.length} grants` : ""}
                  </div>
                </div>
                <Pill tone={CLASS_TONE[f.classification]} dot>
                  {f.classification}
                </Pill>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
