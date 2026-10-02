import Link from "next/link";
import type { PostCategory } from "@/types/wordpress";

interface CategoryBadgeProps {
  category: PostCategory;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <Link
      href={`/blog/${category.slug}`}
      className="relative z-10 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100"
    >
      {category.name}
    </Link>
  );
}
