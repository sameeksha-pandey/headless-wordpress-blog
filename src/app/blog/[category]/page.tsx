import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryPills from "@/components/blog/CategoryPills";
import PostGrid from "@/components/blog/PostGrid";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { getCategories, getCategoryBySlug, getPosts } from "@/utils/wordpress";

export const revalidate = 3600;

const POSTS_PER_PAGE = 9;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };

  return {
    title: category.name,
    description: category.description || `Read all ${category.name} articles on the BabyMD blog.`,
    alternates: { canonical: `/blog/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [category, categories] = await Promise.all([getCategoryBySlug(slug), getCategories()]);
  if (!category) notFound();

  const { posts, totalPages } = await getPosts({ categoryId: category.id, page, limit: POSTS_PER_PAGE });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: category.name },
        ]}
      />

      <header className="mb-8 mt-6">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{category.name}</h1>
        {category.description && <p className="mt-3 max-w-2xl text-slate-600">{category.description}</p>}
        <p className="mt-3 text-sm font-medium text-slate-500">
          {category.count} {category.count === 1 ? "article" : "articles"}
        </p>
      </header>

      <section className="mb-8">
        <CategoryPills categories={categories} activeSlug={category.slug} />
      </section>

      {posts.length > 0 ? (
        <PostGrid posts={posts} />
      ) : (
        <EmptyState
          title="No articles yet"
          message={`There are no posts in ${category.name} right now. Please check back soon.`}
        />
      )}

      <Pagination currentPage={page} totalPages={totalPages} basePath={`/blog/${category.slug}`} />
    </div>
  );
}
