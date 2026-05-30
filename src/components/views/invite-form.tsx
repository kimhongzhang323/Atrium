"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Icon } from "@/components/ui/icons";
import { inviteMember } from "@/server/actions/org-admin";

const INPUT = "border border-[--border] rounded px-3 py-2 bg-[--bg-elev] text-sm";
const ROLES = [
  "director",
  "vice_director",
  "secretary",
  "treasurer",
  "dept_head",
  "protocol",
  "committee",
] as const;
const DEPTS = ["SPR", "PnP", "PUB", "LOGI", "MM", "TECH"] as const;

const formSchema = z.object({
  email: z.string().email("Valid email required"),
  role: z.enum(ROLES),
  dept: z.enum(["", ...DEPTS]),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULTS: FormValues = { email: "", role: "committee", dept: "" };

export function InviteForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

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
    setSent(false);
    const res = await inviteMember({
      email: values.email,
      role: values.role,
      dept: values.dept === "" ? undefined : values.dept,
    });
    if (res.ok) {
      reset(DEFAULTS);
      setSent(true);
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
        <Icon.plus size={12} /> Invite member
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ width: 340 }}>
      <div className="card-header">
        <h3 className="card-title">Invite member</h3>
        <button type="button" className="btn ghost" onClick={() => setOpen(false)} aria-label="Cancel">
          Cancel
        </button>
      </div>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="Email" id="iv-email" error={errors.email?.message}>
          <input id="iv-email" className={INPUT} placeholder="name@um.edu.my" {...register("email")} />
        </Field>
        <Field label="Role" id="iv-role" error={errors.role?.message}>
          <select id="iv-role" className={INPUT} {...register("role")}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Department (optional)" id="iv-dept" error={errors.dept?.message}>
          <select id="iv-dept" className={INPUT} {...register("dept")}>
            <option value="">No department</option>
            {DEPTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>

        {serverError && (
          <p className="text-sm text-[--danger]" role="alert">
            {serverError}
          </p>
        )}
        {sent && <p className="text-sm text-[--success]">Invitation created.</p>}

        <button type="submit" className="btn primary" disabled={isSubmitting}>
          {isSubmitting ? "Inviting…" : "Send invite"}
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
