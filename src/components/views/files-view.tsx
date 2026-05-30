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

export function FilesView({ files }: { files: FileRow[] }) {
  return (
    <div className="view view-wide">
      <div className="view-header">
        <div>
          <div className="eyebrow">FILES</div>
          <h1 className="view-title">Files</h1>
          <p className="view-subtitle">{files.length} Drive-linked documents</p>
        </div>
        <FileLinkForm />
      </div>

      {files.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              No files linked yet. Atrium references Google Drive files — nothing is stored here.
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body tight">
            {files.map((f) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
