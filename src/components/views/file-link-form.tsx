"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Icon } from "@/components/ui/icons";
import { linkDriveFile } from "@/server/actions/files";

const INPUT = "border border-[--border] rounded px-3 py-2 bg-[--bg-elev] text-sm";
const CLASSES = ["public", "internal", "restricted", "confidential"] as const;

const formSchema = z.object({
  name: z.string().min(1, "Required").max(240),
  driveFileId: z.string().min(1, "Required"),
  driveMimeType: z.string().min(1, "Required"),
  classification: z.enum(CLASSES),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULTS: FormValues = {
  name: "",
  driveFileId: "",
  driveMimeType: "application/pdf",
  classification: "internal",
};

export function FileLinkForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULTS,
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await linkDriveFile(values);
    if (res.ok) {
      reset(DEFAULTS);
      setOpen(false);
      router.refresh();
      return;
    }
    if (res.error.fields) {
      for (const [field, message] of Object.entries(res.error.fields)) {
        setError(field as keyof FormValues, { message });
      }
    }
    setServerError(res.error.message);
  });

  if (!open) {
    return (
      <button className="btn primary" onClick={() => setOpen(true)} aria-expanded={false}>
        <Icon.plus size={12} /> Link Drive file
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ width: 360 }}>
      <div className="card-header">
        <h3 className="card-title">Link a Drive file</h3>
        <button type="button" className="btn ghost" onClick={() => setOpen(false)} aria-label="Cancel">
          Cancel
        </button>
      </div>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="Name" id="fl-name" error={errors.name?.message}>
          <input id="fl-name" className={INPUT} placeholder="MOU draft" {...register("name")} />
        </Field>
        <Field label="Drive file ID" id="fl-id" error={errors.driveFileId?.message}>
          <input id="fl-id" className={INPUT} placeholder="1AbC…" {...register("driveFileId")} />
        </Field>
        <Field label="MIME type" id="fl-mime" error={errors.driveMimeType?.message}>
          <input id="fl-mime" className={INPUT} {...register("driveMimeType")} />
        </Field>
        <Field label="Classification" id="fl-class" error={errors.classification?.message}>
          <select id="fl-class" className={INPUT} {...register("classification")}>
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        {serverError && (
          <p className="text-sm text-[--danger]" role="alert">
            {serverError}
          </p>
        )}

        <button type="submit" className="btn primary" disabled={isSubmitting}>
          {isSubmitting ? "Linking…" : "Link file"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label htmlFor={id} style={{ fontSize: 12, color: "var(--text-secondary)" }}>
        {label}
      </label>
      {children}
      {error && (
        <span id={`${id}-error`} className="text-sm text-[--danger]" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
