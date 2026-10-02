import Link from "next/link";
import type { Category } from "@/types/wordpress";

interface CategoryPillsProps {
  categories: Category[];
  activeSlug?: string;
}

export default function CategoryPills({ categories, activeSlug }: CategoryPillsProps) {
  const pillClass = (active: boolean) =>
    `block shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
      active
        ? "border-brand-600 bg-brand-600 text-white"
        : "border-slate-200 bg-white text-slate-700 hover:border-brand-600 hover:text-brand-600"
    }`;

  return (
    <nav aria-label="Categories" className="-mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:overflow-visible md:px-0">
      <ul className="flex gap-2 md:flex-wrap">
        <li>
          <Link href="/blog" className={pillClass(!activeSlug)} aria-current={!activeSlug ? "page" : undefined}>
            All
          </Link>
        </li>
        {categories.map((category) => {
          const active = category.slug === activeSlug;
          return (
            <li key={category.id}>
              <Link
                href={`/blog/${category.slug}`}
                className={pillClass(active)}
                aria-current={active ? "page" : undefined}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
