"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Icon } from "@/components/ui/icons";
import { createEvent } from "@/server/actions/events";

const INPUT = "border border-[--border] rounded px-3 py-2 bg-[--bg-elev] text-sm";

// Mirrors the fields of createEventSchema (server stays authoritative). Kept
// local because @hookform/resolvers can't type the schema's `.default()`
// input≠output transform through useForm without casts.
const formSchema = z.object({
  code: z.string().min(1, "Required").max(16),
  name: z.string().min(1, "Required").max(120),
  venue: z.string().min(1, "Required").max(160),
  budgetTotal: z.number().int().nonnegative(),
  sponsorTarget: z.number().int().nonnegative(),
  registrationsTarget: z.number().int().nonnegative(),
  isCompetition: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULTS: FormValues = {
  code: "",
  name: "",
  venue: "",
  budgetTotal: 0,
  sponsorTarget: 0,
  registrationsTarget: 0,
  isCompetition: false,
};

export function EventCreateForm() {
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
    const res = await createEvent(values);
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
        <Icon.plus size={12} /> New event
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ width: 360 }}>
      <div className="card-header">
        <h3 className="card-title">New event</h3>
        <button
          type="button"
          className="btn ghost"
          onClick={() => setOpen(false)}
          aria-label="Cancel"
        >
          Cancel
        </button>
      </div>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="Code" id="ev-code" error={errors.code?.message}>
          <input id="ev-code" className={INPUT} placeholder="MT28" {...register("code")} />
        </Field>
        <Field label="Name" id="ev-name" error={errors.name?.message}>
          <input id="ev-name" className={INPUT} placeholder="MYTECH 2028" {...register("name")} />
        </Field>
        <Field label="Venue" id="ev-venue" error={errors.venue?.message}>
          <input
            id="ev-venue"
            className={INPUT}
            placeholder="FCSIT, Universiti Malaya"
            {...register("venue")}
          />
        </Field>
        <Field label="Budget target (RM)" id="ev-budget" error={errors.budgetTotal?.message}>
          <input
            id="ev-budget"
            type="number"
            min={0}
            className={INPUT}
            {...register("budgetTotal", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Sponsor target (RM)" id="ev-sponsor" error={errors.sponsorTarget?.message}>
          <input
            id="ev-sponsor"
            type="number"
            min={0}
            className={INPUT}
            {...register("sponsorTarget", { valueAsNumber: true })}
          />
        </Field>
        <Field
          label="Registration target"
          id="ev-reg"
          error={errors.registrationsTarget?.message}
        >
          <input
            id="ev-reg"
            type="number"
            min={0}
            className={INPUT}
            {...register("registrationsTarget", { valueAsNumber: true })}
          />
        </Field>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <input type="checkbox" {...register("isCompetition")} />
          Competition event
        </label>

        {serverError && (
          <p className="text-sm text-[--danger]" role="alert">
            {serverError}
          </p>
        )}

        <button type="submit" className="btn primary" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create event"}
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
