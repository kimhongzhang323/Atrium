"use client";

import { useState, useTransition } from "react";

import { updateProfile } from "@/server/actions/profile";

export function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await updateProfile({ name });
      if (res.ok) setSuccess(true);
      else setError(res.error.fields?.name ?? res.error.message);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label htmlFor="profile-name" className="flex flex-col gap-1">
        <span className="text-sm text-[--text-secondary]">Name</span>
        <input
          id="profile-name"
          className="border border-[--border] rounded px-3 py-2 bg-[--bg-elev]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={pending}
          aria-describedby={error ? "profile-name-error" : undefined}
        />
      </label>
      {error && (
        <p id="profile-name-error" className="text-sm text-[--danger]" role="alert">
          {error}
        </p>
      )}
      {success && <p className="text-sm text-[--success]">Saved.</p>}
      <button
        type="submit"
        className="rounded bg-[--accent] text-white px-3 py-2 text-sm disabled:opacity-50"
        disabled={pending || name.trim() === ""}
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
