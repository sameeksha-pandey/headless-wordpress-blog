import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import CategoryBadge from "@/components/blog/CategoryBadge";
import PostContent from "@/components/blog/PostContent";
import PostImage from "@/components/blog/PostImage";
import RelatedPosts from "@/components/blog/RelatedPosts";
import ShareButtons from "@/components/blog/ShareButtons";
import TableOfContents from "@/components/blog/TableOfContents";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { formatDate } from "@/utils/formatters";
import { getPostBySlug, getPosts, getRelatedPosts } from "@/utils/wordpress";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface ArticlePageProps {
  params: Promise<{ category: string; slug: string }>;
}

// Only the latest posts are built ahead of time, the rest are cached on first visit
export async function generateStaticParams() {
  const { posts } = await getPosts({ limit: 10 });

  return posts.map((post) => ({
    category: post.categories[0]?.slug ?? "uncategorized",
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found" };

  const { seo } = post;
  const url = `/blog/${category}/${post.slug}`;
  const images = seo.ogImage ? [seo.ogImage] : post.featuredImage ? [post.featuredImage.url] : [];

  return {
    // absolute stops the layout template from adding the site name twice
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: url },
    robots: { index: seo.robots.index, follow: seo.robots.follow },
    openGraph: {
      type: "article",
      url,
      title: seo.ogTitle,
      description: seo.ogDescription,
      images,
      publishedTime: seo.publishedTime ?? post.date,
      modifiedTime: seo.modifiedTime ?? post.modified,
      authors: [post.author.name],
    },
    twitter: {
      card: seo.twitterCard === "summary" ? "summary" : "summary_large_image",
      title: seo.ogTitle,
      description: seo.ogDescription,
      images,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { category: categorySlug, slug } = await params;
  const post = await getPostBySlug(slug);

  // Also 404 when the post is opened under a category it does not belong to
  const category = post?.categories.find((c) => c.slug === categorySlug);
  if (!post || !category) notFound();

  const relatedPosts = await getRelatedPosts(category.id, post.id);
  const postUrl = `${SITE_URL}/blog/${category.slug}/${post.slug}`;

  return (
    <article className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: category.name, href: `/blog/${category.slug}` },
          { label: post.title },
        ]}
      />

      <header className="mx-auto mt-8 max-w-3xl text-center">
        <div className="flex flex-wrap justify-center gap-2">
          {post.categories.map((c) => (
            <CategoryBadge key={c.id} category={c} />
          ))}
        </div>

        <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
          {post.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            {post.author.avatar && (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <span className="font-medium text-slate-800">{post.author.name}</span>
          </div>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">&middot;</span>
          <span>{post.readingTime} min read</span>
        </div>
      </header>

      <div className="relative mx-auto mt-10 aspect-video max-w-5xl overflow-hidden rounded-3xl bg-slate-100">
        <PostImage image={post.featuredImage} sizes="(max-width: 1024px) 100vw, 1024px" priority />
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <TableOfContents items={post.toc} />
          </div>
        </aside>

        <div className="min-w-0 lg:col-span-3">
          <PostContent html={post.content} />

          <div className="mt-12 border-t border-slate-200 pt-6">
            <ShareButtons url={postUrl} title={post.title} />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-5xl">
        <RelatedPosts posts={relatedPosts} />
      </div>
    </article>
  );
}
