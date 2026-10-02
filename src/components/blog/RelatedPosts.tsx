import type { Post } from "@/types/wordpress";
import PostGrid from "./PostGrid";

interface RelatedPostsProps {
  posts: Post[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="border-t border-slate-200 pt-12">
      <h2 id="related-heading" className="mb-6 text-2xl font-bold text-slate-900">
        Related Articles
      </h2>
      <PostGrid posts={posts} />
    </section>
  );
}
