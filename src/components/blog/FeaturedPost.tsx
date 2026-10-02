import Link from "next/link";
import type { Post } from "@/types/wordpress";
import { formatDate } from "@/utils/formatters";
import { getPostUrl } from "@/utils/wordpress";
import CategoryBadge from "./CategoryBadge";
import PostImage from "./PostImage";

interface FeaturedPostProps {
  post: Post;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  const category = post.categories[0];

  return (
    <article className="group relative grid overflow-hidden rounded-3xl border border-slate-200 bg-white lg:grid-cols-2">
      <div className="relative aspect-video bg-slate-100 lg:aspect-auto lg:min-h-96">
        <PostImage image={post.featuredImage} sizes="(max-width: 1024px) 100vw, 50vw" priority />
      </div>

      <div className="flex flex-col justify-center p-6 sm:p-10">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Featured</span>
          {category && <CategoryBadge category={category} />}
        </div>

        <h2 className="text-2xl font-bold leading-tight text-slate-900 group-hover:text-brand-600 sm:text-3xl">
          <Link href={getPostUrl(post)} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h2>

        <p className="mt-4 line-clamp-3 text-slate-600">{post.excerpt}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
          <span className="font-medium text-slate-700">{post.author.name}</span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">&middot;</span>
          <span>{post.readingTime} min read</span>
        </div>
      </div>
    </article>
  );
}
