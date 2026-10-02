// Raw types returned by the WordPress REST API

export interface WPRendered {
  rendered: string;
}

export interface WPAuthor {
  id: number;
  name: string;
  slug: string;
  avatar_urls?: Record<string, string>;
}

export interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details?: {
    width?: number;
    height?: number;
  };
}

export interface WPTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
}

export interface YoastImage {
  url: string;
  width?: number;
  height?: number;
  type?: string;
}

export interface YoastHeadJson {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: {
    index?: string;
    follow?: string;
  };
  og_locale?: string;
  og_type?: string;
  og_title?: string;
  og_description?: string;
  og_url?: string;
  og_site_name?: string;
  og_image?: YoastImage[];
  article_published_time?: string;
  article_modified_time?: string;
  author?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
}

export interface WPPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  sticky: boolean;
  title: WPRendered;
  content: WPRendered;
  excerpt: WPRendered;
  author: number;
  featured_media: number;
  categories: number[];
  yoast_head_json?: YoastHeadJson;
  _embedded?: {
    author?: WPAuthor[];
    "wp:featuredmedia"?: WPMedia[];
    "wp:term"?: WPTerm[][];
  };
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  description: string;
}

// Cleaned up types used by the app

export interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  description: string;
}

export interface PostCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Author {
  name: string;
  avatar: string | null;
}

export interface FeaturedImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  modified: string;
  sticky: boolean;
  author: Author;
  featuredImage: FeaturedImage | null;
  categories: PostCategory[];
  readingTime: number;
}

export interface SeoData {
  title: string;
  description: string;
  canonical: string | null;
  robots: {
    index: boolean;
    follow: boolean;
  };
  ogTitle: string;
  ogDescription: string;
  ogImage: string | null;
  ogType: string;
  twitterCard: string;
  publishedTime: string | null;
  modifiedTime: string | null;
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface PostDetail extends Post {
  content: string;
  toc: TocItem[];
  seo: SeoData;
}

export interface PaginatedPosts {
  posts: Post[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface GetPostsOptions {
  page?: number;
  limit?: number;
  categoryId?: number;
  search?: string;
  exclude?: number[];
  sticky?: boolean;
}
