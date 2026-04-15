import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mt-24 text-center">
      <h1 className="text-4xl font-bold">Not found</h1>
      <p className="mt-4 text-slate-500 dark:text-slate-400">The page you requested does not exist.</p>
      <p className="mt-6">
        <Link href="/">Go back home</Link>
      </p>
    </div>
  );
}
