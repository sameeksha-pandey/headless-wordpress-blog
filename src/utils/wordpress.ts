import type {
  Category,
  FeaturedImage,
  GetPostsOptions,
  PaginatedPosts,
  Post,
  PostDetail,
  SeoData,
  WPCategory,
  WPPost,
} from "@/types/wordpress";
import {
  addHeadingIds,
  cleanExcerpt,
  cleanText,
  decodeEntities,
  getReadingTime,
  sanitizeContent,
} from "@/utils/formatters";

export const API_URL =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ?? "https://blog.babymd.in/wp-json/wp/v2";

export const REVALIDATE_SECONDS = 3600;

interface FetchResult<T> {
  data: T;
  total: number;
  totalPages: number;
}

async function fetchFromWordPress<T>(path: string, retries = 1): Promise<FetchResult<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: "force-cache",
    next: { revalidate: REVALIDATE_SECONDS, tags: ["wordpress"] },
  });

  // The WordPress server sometimes returns 500 when it gets many requests at once
  if (res.status >= 500 && retries > 0) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return fetchFromWordPress<T>(path, retries - 1);
  }

  if (!res.ok) {
    throw new Error(`WordPress request failed: ${res.status} ${path}`);
  }

  const data = (await res.json()) as T;

  return {
    data,
    total: Number(res.headers.get("X-WP-Total") ?? 0),
    totalPages: Number(res.headers.get("X-WP-TotalPages") ?? 0),
  };
}

// Uses embedded media first, then the Yoast image, then the first image in the content
function getFeaturedImage(post: WPPost, title: string): FeaturedImage | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (media?.source_url) {
    return {
      url: media.source_url,
      alt: media.alt_text || title,
      width: media.media_details?.width ?? 1200,
      height: media.media_details?.height ?? 675,
    };
  }

  const yoastImage = post.yoast_head_json?.og_image?.[0];
  if (yoastImage?.url) {
    return {
      url: yoastImage.url,
      alt: title,
      width: yoastImage.width ?? 1200,
      height: yoastImage.height ?? 675,
    };
  }

  const match = post.content.rendered.match(/<img[^>]+src="([^"]+)"/);
  if (match) {
    return { url: match[1], alt: title, width: 1200, height: 675 };
  }

  return null;
}

function formatPost(post: WPPost): Post {
  const title = cleanText(post.title.rendered);
  const author = post._embedded?.author?.[0];
  const terms = post._embedded?.["wp:term"]?.flat() ?? [];

  return {
    id: post.id,
    slug: post.slug,
    title,
    excerpt: cleanExcerpt(post.excerpt.rendered),
    date: post.date,
    modified: post.modified,
    sticky: post.sticky,
    author: {
      name: author?.name ?? "BabyMD Team",
      avatar: author?.avatar_urls?.["96"] ?? null,
    },
    featuredImage: getFeaturedImage(post, title),
    categories: terms
      .filter((term) => term.taxonomy === "category")
      .map((term) => ({ id: term.id, name: decodeEntities(term.name), slug: term.slug })),
    readingTime: getReadingTime(post.content.rendered),
  };
}

function formatSeo(post: WPPost, fallbackTitle: string, fallbackDescription: string): SeoData {
  const yoast = post.yoast_head_json ?? {};

  return {
    title: decodeEntities(yoast.title ?? fallbackTitle),
    description: decodeEntities(yoast.description ?? fallbackDescription),
    canonical: yoast.canonical ?? null,
    robots: {
      index: yoast.robots?.index !== "noindex",
      follow: yoast.robots?.follow !== "nofollow",
    },
    ogTitle: decodeEntities(yoast.og_title ?? yoast.title ?? fallbackTitle),
    ogDescription: decodeEntities(yoast.og_description ?? yoast.description ?? fallbackDescription),
    ogImage: yoast.og_image?.[0]?.url ?? null,
    ogType: yoast.og_type ?? "article",
    twitterCard: yoast.twitter_card ?? "summary_large_image",
    publishedTime: yoast.article_published_time ?? null,
    modifiedTime: yoast.article_modified_time ?? null,
  };
}

export async function getPosts(options: GetPostsOptions = {}): Promise<PaginatedPosts> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;

  const params = new URLSearchParams({
    _embed: "true",
    page: String(page),
    per_page: String(limit),
  });

  if (options.categoryId) params.set("categories", String(options.categoryId));
  if (options.search) params.set("search", options.search);
  if (options.exclude?.length) params.set("exclude", options.exclude.join(","));
  if (options.sticky) params.set("sticky", "true");

  // WordPress returns 400 when the page number is past the last page
  try {
    const { data, total, totalPages } = await fetchFromWordPress<WPPost[]>(`/posts?${params}`);
    return { posts: data.map(formatPost), total, totalPages, page, limit };
  } catch (error) {
    if (page > 1) return { posts: [], total: 0, totalPages: 0, page, limit };
    throw error;
  }
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const { data } = await fetchFromWordPress<WPPost[]>(
    `/posts?slug=${encodeURIComponent(slug)}&_embed=true`
  );

  const post = data[0];
  if (!post) return null;

  const formatted = formatPost(post);
  const { html, toc } = addHeadingIds(sanitizeContent(post.content.rendered));

  return {
    ...formatted,
    content: html,
    toc,
    seo: formatSeo(post, formatted.title, formatted.excerpt),
  };
}

function formatCategory(category: WPCategory): Category {
  return {
    id: category.id,
    name: decodeEntities(category.name),
    slug: category.slug,
    count: category.count,
    description: cleanText(category.description),
  };
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await fetchFromWordPress<WPCategory[]>("/categories?per_page=50");
  return data.filter((category) => category.count > 0).map(formatCategory);
}

// Not filtered by count, so an empty category can still show its empty state
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data } = await fetchFromWordPress<WPCategory[]>(
    `/categories?slug=${encodeURIComponent(slug)}`
  );
  return data[0] ? formatCategory(data[0]) : null;
}

// Gets the sticky post if there is one, otherwise the latest post
export async function getFeaturedPost(): Promise<Post | null> {
  const sticky = await getPosts({ sticky: true, limit: 1 });
  if (sticky.posts.length > 0) return sticky.posts[0];

  const latest = await getPosts({ limit: 1 });
  return latest.posts[0] ?? null;
}

export async function getRelatedPosts(categoryId: number, postId: number): Promise<Post[]> {
  const { posts } = await getPosts({ categoryId, exclude: [postId], limit: 3 });
  return posts;
}

export function getPostUrl(post: Post): string {
  const category = post.categories[0]?.slug ?? "uncategorized";
  return `/blog/${category}/${post.slug}`;
}

interface SitemapPost {
  slug: string;
  modified: string;
  categories: number[];
}

// Only asks for the fields the sitemap needs to keep the response small
export async function getAllPostsForSitemap(): Promise<SitemapPost[]> {
  const fields = "_fields=slug,modified,categories&per_page=100";
  const first = await fetchFromWordPress<SitemapPost[]>(`/posts?${fields}&page=1`);
  const posts = [...first.data];

  for (let page = 2; page <= first.totalPages; page++) {
    const next = await fetchFromWordPress<SitemapPost[]>(`/posts?${fields}&page=${page}`);
    posts.push(...next.data);
  }

  return posts;
}
