"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Icon } from "@/components/ui/icons";
import { createSponsor } from "@/server/actions/sponsors";

const INPUT = "border border-[--border] rounded px-3 py-2 bg-[--bg-elev] text-sm";

// Mirrors the submittable fields of createSponsorSchema (server authoritative).
const formSchema = z.object({
  name: z.string().min(1, "Required").max(160),
  tier: z.string().max(40),
  amountTarget: z.number().int().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULTS: FormValues = { name: "", tier: "", amountTarget: 0 };

export function SponsorCreateForm() {
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
    const res = await createSponsor({
      name: values.name,
      tier: values.tier || undefined,
      amountTarget: values.amountTarget,
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
        <Icon.plus size={12} /> Add sponsor
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ width: 340 }}>
      <div className="card-header">
        <h3 className="card-title">Add sponsor</h3>
        <button type="button" className="btn ghost" onClick={() => setOpen(false)} aria-label="Cancel">
          Cancel
        </button>
      </div>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="Name" id="sp-name" error={errors.name?.message}>
          <input id="sp-name" className={INPUT} placeholder="Maybank" {...register("name")} />
        </Field>
        <Field label="Tier (optional)" id="sp-tier" error={errors.tier?.message}>
          <input id="sp-tier" className={INPUT} placeholder="Platinum" {...register("tier")} />
        </Field>
        <Field label="Target amount (RM)" id="sp-amount" error={errors.amountTarget?.message}>
          <input
            id="sp-amount"
            type="number"
            min={0}
            className={INPUT}
            {...register("amountTarget", { valueAsNumber: true })}
          />
        </Field>

        {serverError && (
          <p className="text-sm text-[--danger]" role="alert">
            {serverError}
          </p>
        )}

        <button type="submit" className="btn primary" disabled={isSubmitting}>
          {isSubmitting ? "Adding…" : "Add sponsor"}
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
