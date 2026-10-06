"use client";

import { useActionState } from "react";
import { Field, inputClass } from "@/components/field";
import { signIn, type LoginState } from "../actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    signIn,
    {},
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <Field label="Email" name="email">
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <Field label="Password" name="password">
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
