import type { TocItem } from "@/types/wordpress";

interface TableOfContentsProps {
  items: TocItem[];
}

// Smooth scrolling comes from scroll-behavior in globals.css
export default function TableOfContents({ items }: TableOfContentsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900">On this page</h2>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
            <a href={`#${item.id}`} className="text-slate-600 hover:text-brand-600">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
