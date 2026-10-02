import Link from "next/link";
import type { Post } from "@/types/wordpress";
import { formatDate } from "@/utils/formatters";
import { getPostUrl } from "@/utils/wordpress";
import CategoryBadge from "./CategoryBadge";
import PostImage from "./PostImage";

interface BlogCardProps {
  post: Post;
}

export default function BlogCard({ post }: BlogCardProps) {
  const category = post.categories[0];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <PostImage
          image={post.featuredImage}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        {category && (
          <div className="mb-3">
            <CategoryBadge category={category} />
          </div>
        )}

        <h3 className="text-lg font-semibold leading-snug text-slate-900 group-hover:text-brand-600">
          {/* The after: overlay makes the whole card clickable */}
          <Link href={getPostUrl(post)} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">{post.excerpt}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
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
