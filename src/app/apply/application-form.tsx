"use client";

import { useActionState } from "react";
import { Field, inputClass } from "@/components/field";
import { DOCUMENT_TYPES, MEMBERSHIP_TYPES, PHOTO_TYPES } from "@/lib/applications";
import { submitApplication, type ApplyState } from "./actions";

const initialState: ApplyState = { status: "idle" };

export function ApplicationForm() {
  const [state, formAction, pending] = useActionState(
    submitApplication,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="mt-8 rounded-xl border border-brand-100 bg-brand-50 p-6">
        <h2 className="text-lg font-semibold text-brand-800">
          Application received
        </h2>
        <p className="mt-2 text-stone-700">
          Thank you. The committee will review your application and contact you
          by email.
        </p>
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};
  const props = (name: string) => ({
    id: name,
    name,
    defaultValue: values[name],
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    className: inputClass,
  });

  return (
    // key resets uncontrolled inputs to the echoed values after each attempt.
    <form
      key={JSON.stringify(values)}
      action={formAction}
      className="mt-8 space-y-8"
      noValidate
    >
      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.message}
        </p>
      )}

      <Section title="Contact details">
        <Field label="Full name (as in IC/passport)" name="full_name" error={errors.full_name}>
          <input {...props("full_name")} autoComplete="name" required />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Email" name="email" error={errors.email}>
            <input {...props("email")} type="email" autoComplete="email" required />
          </Field>
          <Field label="Phone" name="phone" error={errors.phone} hint="e.g. +60 12-345 6789">
            <input {...props("phone")} type="tel" autoComplete="tel" required />
          </Field>
        </div>
      </Section>

      <Section title="Identity">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="IC / passport number" name="id_number" error={errors.id_number}>
            <input {...props("id_number")} required />
          </Field>
          <Field label="Date of birth" name="date_of_birth" error={errors.date_of_birth}>
            <input {...props("date_of_birth")} type="date" autoComplete="bday" required />
          </Field>
        </div>
        <Field label="Address" name="address" error={errors.address}>
          <textarea {...props("address")} rows={3} autoComplete="street-address" required />
        </Field>
      </Section>

      <Section title="Membership">
        <Field label="Membership type" name="membership_type" error={errors.membership_type}>
          <select {...props("membership_type")} defaultValue={values.membership_type ?? ""} required>
            <option value="" disabled>
              Choose one
            </option>
            {Object.entries(MEMBERSHIP_TYPES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Why do you want to join?" name="reason" error={errors.reason}>
          <textarea {...props("reason")} rows={4} required />
        </Field>
        <Field label="Referred by (optional)" name="referral" error={errors.referral} hint="Name or membership number of an existing member">
          <input {...props("referral")} />
        </Field>
      </Section>

      <Section title="Documents">
        <Field label="Photo" name="photo" error={errors.photo} hint="JPG, PNG or WebP, up to 2 MB">
          <input {...props("photo")} defaultValue={undefined} type="file" accept={PHOTO_TYPES.join(",")} required />
        </Field>
        <Field label="Supporting document" name="document" error={errors.document} hint="IC copy or payment slip. JPG, PNG, WebP or PDF, up to 2 MB">
          <input {...props("document")} defaultValue={undefined} type="file" accept={DOCUMENT_TYPES.join(",")} required />
        </Field>
      </Section>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-6 rounded-xl border border-stone-200 bg-white p-6">
      <legend className="px-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}
