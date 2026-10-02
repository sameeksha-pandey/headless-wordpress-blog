import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Article not found</h1>
      <p className="mt-4 text-slate-600">This article may have been removed or the link is incorrect.</p>
      <Link
        href="/blog"
        className="mt-8 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        Browse all articles
      </Link>
    </div>
  );
}
