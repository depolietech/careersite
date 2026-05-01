import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="shrink-0">
      <span className="inline-flex items-center justify-center rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-gray-900">
        Logo
      </span>
    </Link>
  );
}
