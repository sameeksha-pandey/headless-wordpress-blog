import Link from "next/link";

interface EmptyStateProps {
  title: string;
  message: string;
}

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-slate-600">{message}</p>
      <Link href="/blog" className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline">
        Browse all articles
      </Link>
    </div>
  );
}
