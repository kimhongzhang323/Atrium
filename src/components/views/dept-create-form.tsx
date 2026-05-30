"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Icon } from "@/components/ui/icons";
import { createDepartment } from "@/server/actions/org-admin";

const INPUT = "border border-[--border] rounded px-3 py-2 bg-[--bg-elev] text-sm";

const formSchema = z.object({
  code: z.string().min(1, "Required").max(16),
  name: z.string().min(1, "Required").max(80),
  color: z.string().max(16),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULTS: FormValues = { code: "", name: "", color: "" };

export function DeptCreateForm() {
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
    const res = await createDepartment({
      code: values.code,
      name: values.name,
      color: values.color || undefined,
    });
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
      <button className="btn" onClick={() => setOpen(true)} aria-expanded={false}>
        <Icon.plus size={12} /> New department
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ width: 320 }}>
      <div className="card-header">
        <h3 className="card-title">New department</h3>
        <button type="button" className="btn ghost" onClick={() => setOpen(false)} aria-label="Cancel">
          Cancel
        </button>
      </div>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="Code" id="dp-code" error={errors.code?.message}>
          <input id="dp-code" className={INPUT} placeholder="FIN" {...register("code")} />
        </Field>
        <Field label="Name" id="dp-name" error={errors.name?.message}>
          <input id="dp-name" className={INPUT} placeholder="Finance" {...register("name")} />
        </Field>
        <Field label="Color (optional)" id="dp-color" error={errors.color?.message}>
          <input id="dp-color" className={INPUT} placeholder="#6e6e73" {...register("color")} />
        </Field>

        {serverError && (
          <p className="text-sm text-[--danger]" role="alert">
            {serverError}
          </p>
        )}

        <button type="submit" className="btn primary" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create"}
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
