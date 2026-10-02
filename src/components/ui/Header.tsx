import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/blog" className="text-xl font-bold text-slate-900">
          Baby<span className="text-brand-600">MD</span> Blog
        </Link>
        <nav className="flex gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-brand-600">
            Home
          </Link>
          <Link href="/blog" className="hover:text-brand-600">
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
}
