"use client";

import { useActionState } from "react";
import { inputClass } from "@/components/field";
import { reviewApplication, type ReviewState } from "../actions";

export function ReviewForm({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(
    reviewApplication,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-stone-700">
          Note
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          className={inputClass}
          placeholder="Required when rejecting. Optional when approving."
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          name="decision"
          value="approved"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          Approve
        </button>
        <button
          type="submit"
          name="decision"
          value="rejected"
          disabled={pending}
          className="rounded-lg border border-red-300 bg-white px-5 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    </form>
  );
}
