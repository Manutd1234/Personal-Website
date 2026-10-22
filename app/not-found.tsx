import Link from "next/link";
export default function NotFound() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-32 sm:px-8">
      <p className="font-mono text-xs text-zinc-500">404 — A WRONG TURN</p>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight">
        Back to the interesting stuff.
      </h1>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center text-emerald-700 dark:text-emerald-300"
      >
        Return to Ian’s portfolio ↗︎
      </Link>
    </main>
  );
}
