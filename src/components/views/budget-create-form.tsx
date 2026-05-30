"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Icon } from "@/components/ui/icons";
import { createBudgetLine } from "@/server/actions/budget";

const INPUT = "border border-[--border] rounded px-3 py-2 bg-[--bg-elev] text-sm";
const DEPTS = ["SPR", "PnP", "PUB", "LOGI", "MM", "TECH"] as const;

const formSchema = z.object({
  eventId: z.string().uuid("Select an event"),
  category: z.string().min(1, "Required").max(80),
  dept: z.enum(["", ...DEPTS]),
  description: z.string().max(400),
  amountPlanned: z.number().int().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export function BudgetCreateForm({ events }: { events: { id: string; code: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const DEFAULTS: FormValues = {
    eventId: events[0]?.id ?? "",
    category: "",
    dept: "",
    description: "",
    amountPlanned: 0,
  };

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
    const res = await createBudgetLine({
      eventId: values.eventId,
      category: values.category,
      description: values.description,
      dept: values.dept === "" ? undefined : values.dept,
      amountPlanned: values.amountPlanned,
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
      <button
        className="btn primary"
        onClick={() => setOpen(true)}
        aria-expanded={false}
        disabled={events.length === 0}
        title={events.length === 0 ? "Create an event first" : undefined}
      >
        <Icon.plus size={12} /> Add budget line
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ width: 360 }}>
      <div className="card-header">
        <h3 className="card-title">Add budget line</h3>
        <button type="button" className="btn ghost" onClick={() => setOpen(false)} aria-label="Cancel">
          Cancel
        </button>
      </div>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="Event" id="bl-event" error={errors.eventId?.message}>
          <select id="bl-event" className={INPUT} {...register("eventId")}>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.code}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category" id="bl-category" error={errors.category?.message}>
          <input id="bl-category" className={INPUT} placeholder="Venue" {...register("category")} />
        </Field>
        <Field label="Department (optional)" id="bl-dept" error={errors.dept?.message}>
          <select id="bl-dept" className={INPUT} {...register("dept")}>
            <option value="">No department</option>
            {DEPTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Planned amount (RM)" id="bl-amount" error={errors.amountPlanned?.message}>
          <input
            id="bl-amount"
            type="number"
            min={0}
            className={INPUT}
            {...register("amountPlanned", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Description (optional)" id="bl-desc" error={errors.description?.message}>
          <input id="bl-desc" className={INPUT} {...register("description")} />
        </Field>

        {serverError && (
          <p className="text-sm text-[--danger]" role="alert">
            {serverError}
          </p>
        )}

        <button type="submit" className="btn primary" disabled={isSubmitting}>
          {isSubmitting ? "Adding…" : "Add line"}
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
