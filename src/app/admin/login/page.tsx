import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin sign in" };

export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Admin sign in</h1>
      <p className="mt-2 text-sm text-stone-600">
        For membership committee members only.
      </p>
      {error === "not-admin" && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          This account isn&apos;t an approver. Ask an existing admin to add you.
        </p>
      )}
      <LoginForm />
    </div>
  );
}
