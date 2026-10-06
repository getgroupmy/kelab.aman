import Link from "next/link";

export default function Home() {
  return (
    <section className="mx-auto max-w-2xl py-12 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        Become a member of Kelab Aman
      </h1>
      <p className="mt-4 text-lg text-stone-600">
        Fill in the application form and upload your documents. Our committee
        reviews every application and will contact you by email.
      </p>
      <Link
        href="/apply"
        className="mt-8 inline-block rounded-lg bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
      >
        Apply for membership
      </Link>
    </section>
  );
}
