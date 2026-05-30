"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Icon } from "@/components/ui/icons";
import { submitInvoice } from "@/server/actions/invoices";

const INPUT = "border border-[--border] rounded px-3 py-2 bg-[--bg-elev] text-sm";

// Mirrors the submittable fields of submitInvoiceSchema (server authoritative).
const formSchema = z.object({
  vendor: z.string().min(1, "Required").max(160),
  amount: z.number().int().positive("Must be greater than 0"),
  reference: z.string().max(80),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULTS: FormValues = { vendor: "", amount: 0, reference: "" };

export function InvoiceSubmitForm() {
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
    const res = await submitInvoice({
      vendor: values.vendor,
      amount: values.amount,
      reference: values.reference || undefined,
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
      <button className="btn primary" onClick={() => setOpen(true)} aria-expanded={false}>
        <Icon.plus size={12} /> Submit invoice
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ width: 360 }}>
      <div className="card-header">
        <h3 className="card-title">Submit invoice</h3>
        <button type="button" className="btn ghost" onClick={() => setOpen(false)} aria-label="Cancel">
          Cancel
        </button>
      </div>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="Vendor" id="inv-vendor" error={errors.vendor?.message}>
          <input id="inv-vendor" className={INPUT} placeholder="Acme Catering" {...register("vendor")} />
        </Field>
        <Field label="Amount (RM)" id="inv-amount" error={errors.amount?.message}>
          <input
            id="inv-amount"
            type="number"
            min={1}
            className={INPUT}
            {...register("amount", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Reference (optional)" id="inv-ref" error={errors.reference?.message}>
          <input id="inv-ref" className={INPUT} placeholder="PO-1234" {...register("reference")} />
        </Field>

        {serverError && (
          <p className="text-sm text-[--danger]" role="alert">
            {serverError}
          </p>
        )}

        <button type="submit" className="btn primary" disabled={isSubmitting}>
          {isSubmitting ? "Submitting…" : "Submit"}
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
