import type { Metadata } from "next";
import CategoryPills from "@/components/blog/CategoryPills";
import FeaturedPost from "@/components/blog/FeaturedPost";
import PostGrid from "@/components/blog/PostGrid";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import SearchBar from "@/components/ui/SearchBar";
import { getCategories, getFeaturedPost, getPosts } from "@/utils/wordpress";

export const revalidate = 3600;

const POSTS_PER_PAGE = 9;

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest articles on baby care, health, nutrition and child development.",
  alternates: { canonical: "/blog" },
};

interface BlogPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search?.trim() ?? "";

  const [categories, featured] = await Promise.all([getCategories(), getFeaturedPost()]);

  // The featured post is left out of the grid so it does not show twice
  const { posts, totalPages, total } = await getPosts({
    page,
    limit: POSTS_PER_PAGE,
    search: search || undefined,
    exclude: !search && featured ? [featured.id] : undefined,
  });

  const showFeatured = featured && page === 1 && !search;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">BabyMD Blog</h1>
          <p className="mt-2 text-slate-600">Expert tips on baby care, health and parenting.</p>
        </div>
        <SearchBar defaultValue={search} />
      </div>

      {showFeatured && (
        <section className="mb-10">
          <FeaturedPost post={featured} />
        </section>
      )}

      <section className="mb-8">
        <CategoryPills categories={categories} />
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold text-slate-900">
          {search ? `${total} result${total === 1 ? "" : "s"} for "${search}"` : "Latest Articles"}
        </h2>

        {posts.length > 0 ? (
          <PostGrid posts={posts} />
        ) : (
          <EmptyState
            title="No articles found"
            message={search ? "Try a different search keyword." : "There are no articles on this page."}
          />
        )}

        <Pagination currentPage={page} totalPages={totalPages} basePath="/blog" search={search} />
      </section>
    </div>
  );
}
