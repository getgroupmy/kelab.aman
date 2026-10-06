import type { Metadata } from "next";
import { ApplicationForm } from "./application-form";

export const metadata: Metadata = { title: "Apply" };

export default function ApplyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">
        Membership application
      </h1>
      <p className="mt-2 text-stone-600">
        All fields are required unless marked optional. Your details are only
        seen by the membership committee.
      </p>
      <ApplicationForm />
    </div>
  );
}
