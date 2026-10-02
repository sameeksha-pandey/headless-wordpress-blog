# Headless WordPress Blog

A responsive, SEO friendly headless blog built with **Next.js (App Router)**, **TypeScript** and **Tailwind CSS**. All content comes from the BabyMD WordPress REST API, and SEO metadata comes from the Yoast SEO plugin.

- WordPress API: `https://blog.babymd.in/wp-json/wp/v2`
- Live URL: https://headless-wordpress-blog-delta.vercel.app/blog

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Folder Structure](#folder-structure)
- [Pages](#pages)
- [API Routes](#api-routes)
- [Components](#components)
- [Data Layer](#data-layer)
- [Caching and Revalidation](#caching-and-revalidation)
- [SEO](#seo)
- [Loading, Error and 404 Handling](#loading-error-and-404-handling)
- [Architectural Decisions](#architectural-decisions)
- [Known Notes](#known-notes)
- [Deployment](#deployment)

## Features

- Blog home page with a featured post, category filter, article grid, pagination and search
- Category pages with header, breadcrumbs, post count, empty state and 404 for unknown categories
- Article page with breadcrumbs, author details, reading time, featured image, styled content, share buttons and related posts
- Table of contents generated from `h2` and `h3` tags with smooth scrolling (bonus)
- Dynamic sitemap at `/blog/sitemap.xml` (bonus)
- Three API routes: `/api/posts`, `/api/posts/[slug]` and `/api/categories`
- Dynamic SEO metadata from Yoast fields
- Skeleton loaders, error page with retry, and custom 404 pages
- HTML entity decoding so codes like `&#8217;` or `&amp;` never show in the UI
- Mobile first responsive design

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode, no `any`) |
| Styling | Tailwind CSS 4 + `@tailwindcss/typography` |
| Data fetching | Fetch API with Next.js caching (`force-cache` + `revalidate`) |
| Images | `next/image` |
| SEO | Next.js Metadata API with `generateMetadata()` |
| HTML cleaning | `sanitize-html` |
| Entity decoding | `html-entities` |

## Getting Started

**Requirements:** Node.js 18.18 or newer and npm.

1. Install packages

```bash
npm install
```

2. Create the env file

```bash
cp .env.example .env.local
```

3. Start the dev server

```bash
npm run dev
```

4. Open http://localhost:3000/blog

Opening `/` redirects to `/blog`.

## Environment Variables

| Name | Description | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_WORDPRESS_API_URL` | WordPress REST API base URL | `https://blog.babymd.in/wp-json/wp/v2` |
| `NEXT_PUBLIC_SITE_URL` | Public URL of this app. Used for canonical links, share links and the sitemap | `http://localhost:3000` |

If `NEXT_PUBLIC_WORDPRESS_API_URL` is not set, the app uses the BabyMD API by default.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout with header, footer and default metadata
│   ├── page.tsx                    # Redirects / to /blog
│   ├── not-found.tsx               # Global 404 page
│   ├── globals.css                 # Tailwind setup and article styles
│   ├── api/
│   │   ├── categories/route.ts     # GET /api/categories
│   │   └── posts/
│   │       ├── route.ts            # GET /api/posts
│   │       └── [slug]/route.ts     # GET /api/posts/[slug]
│   └── blog/
│       ├── page.tsx                # /blog
│       ├── loading.tsx             # Skeleton loader
│       ├── error.tsx               # Error page with retry
│       ├── sitemap.xml/route.ts    # /blog/sitemap.xml
│       └── [category]/
│           ├── page.tsx            # /blog/[category]
│           └── [slug]/
│               ├── page.tsx        # /blog/[category]/[slug]
│               └── not-found.tsx   # Article 404 page
├── components/
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   ├── CategoryBadge.tsx
│   │   ├── CategoryPills.tsx
│   │   ├── FeaturedPost.tsx
│   │   ├── PostContent.tsx
│   │   ├── PostGrid.tsx
│   │   ├── PostImage.tsx
│   │   ├── RelatedPosts.tsx
│   │   ├── ShareButtons.tsx
│   │   └── TableOfContents.tsx
│   └── ui/
│       ├── Breadcrumbs.tsx
│       ├── EmptyState.tsx
│       ├── Footer.tsx
│       ├── Header.tsx
│       ├── Pagination.tsx
│       └── SearchBar.tsx
├── types/
│   └── wordpress.ts                # Types for raw WordPress data and cleaned app data
└── utils/
    ├── wordpress.ts                # All WordPress API calls and data formatting
    └── formatters.ts               # Date, reading time, entity decoding, sanitizing, TOC helpers
```

## Pages

### `/blog` - Blog Home

- **Featured section:** large banner for the sticky post, or the latest post if none is sticky. Shows category badge, date, author and reading time.
- **Search:** search box at the top. Uses the WordPress `search` parameter on the server (`/blog?search=sleep`).
- **Category filter bar:** links to every category page. Scrolls sideways on mobile and wraps on bigger screens. The active category is highlighted.
- **Articles grid:** 1 column on mobile, 2 on tablet, 3 on desktop. Each card shows the thumbnail, category pill, clean title, clean excerpt, author, date (for example "Mar 11, 2026") and reading time.
- **Pagination:** Previous, Next and page number links (`/blog?page=2`). 9 posts per page.

### `/blog/[category]` - Category Page

- Breadcrumbs: Home > Blog > Category Name
- Category title, description and total post count
- Category filter bar with the current category active
- Grid of posts in that category, with pagination
- Friendly empty state when a category has no posts
- `notFound()` when the category slug does not exist

### `/blog/[category]/[slug]` - Article Page

- Breadcrumbs: Home > Blog > Category > Post Title
- Category badges, H1 title, author avatar and name, published date and reading time
- Featured image banner with alt text
- Table of contents built from the `h2` and `h3` tags in the post
- Sanitized article content styled with the Tailwind typography plugin. Images, embeds, tables, code blocks, blockquotes and links are styled and do not break the layout.
- Share buttons: Copy Link, Twitter / X, LinkedIn and WhatsApp
- Up to 3 related posts from the same category
- `notFound()` when the post does not exist, or when the post does not belong to the category in the URL

### `/blog/sitemap.xml` - Sitemap

XML sitemap with `/blog`, every category page and every post (with `lastmod`). Made with a Next.js route handler and revalidated every hour.

## API Routes

All API routes use the same functions from `utils/wordpress.ts` that the pages use.

### `GET /api/posts`

| Param | Default | Description |
| --- | --- | --- |
| `page` | `1` | Page number |
| `limit` | `10` | Posts per page (max 100) |
| `category` | - | Category slug or ID |
| `search` | - | Search keyword |

Upstream: `/wp-json/wp/v2/posts?_embed=true&...`

Example: `/api/posts?page=1&limit=1&category=parenting`

```json
{
  "posts": [
    {
      "id": 9210,
      "slug": "the-ultimate-guide-to-modern-parenting",
      "title": "The Ultimate Guide to Modern Parenting",
      "excerpt": "Parenting has changed a lot over the years...",
      "date": "2025-09-05T05:20:20",
      "modified": "2025-10-09T06:56:31",
      "sticky": false,
      "author": { "name": "Product Team", "avatar": "https://secure.gravatar.com/..." },
      "featuredImage": { "url": "https://blog.babymd.in/...png", "alt": "...", "width": 1024, "height": 653 },
      "categories": [{ "id": 263, "name": "parenting", "slug": "parenting" }],
      "readingTime": 8
    }
  ],
  "total": 2,
  "totalPages": 2,
  "page": 1,
  "limit": 1
}
```

Errors: `404` if the category slug does not exist, `500` if WordPress fails.

### `GET /api/posts/[slug]`

Upstream: `/wp-json/wp/v2/posts?slug={slug}&_embed=true`

Returns one post with all the fields above plus:

- `content` - sanitized HTML with heading ids
- `toc` - list of headings `{ id, text, level }`
- `seo` - normalized Yoast data (`title`, `description`, `canonical`, `robots`, `ogTitle`, `ogDescription`, `ogImage`, `ogType`, `twitterCard`, `publishedTime`, `modifiedTime`)

Errors: `404` if the post does not exist, `500` if WordPress fails.

### `GET /api/categories`

Upstream: `/wp-json/wp/v2/categories?per_page=50`

```json
[
  { "id": 259, "name": "Baby Care", "slug": "baby-care", "count": 17, "description": "" }
]
```

Empty categories (`count === 0`) are removed.

## Components

### Blog components (`components/blog`)

| Component | Description |
| --- | --- |
| `BlogCard` | Post card with image, category pill, title, excerpt and meta. The whole card is clickable. |
| `CategoryBadge` | Small pill that links to a category page |
| `CategoryPills` | Category filter bar with active state |
| `FeaturedPost` | Large hero card for the featured post |
| `PostContent` | Renders the sanitized article HTML with typography styles |
| `PostGrid` | Responsive 1 / 2 / 3 column grid of `BlogCard`s |
| `PostImage` | `next/image` wrapper with a placeholder when a post has no image |
| `RelatedPosts` | Related articles section |
| `ShareButtons` | Copy link and social share buttons (Client Component) |
| `TableOfContents` | Links to each `h2` / `h3` in the article |

### UI components (`components/ui`)

| Component | Description |
| --- | --- |
| `Header` | Site header with navigation |
| `Footer` | Site footer |
| `Breadcrumbs` | Accessible breadcrumb navigation |
| `Pagination` | Previous / Next and page number links. Keeps the search keyword. |
| `SearchBar` | Search form that submits to `/blog?search=` |
| `EmptyState` | Message shown when there are no posts |

## Data Layer

### `utils/wordpress.ts`

| Function | Description |
| --- | --- |
| `getPosts(options)` | Paginated posts. Supports page, limit, category, search, exclude and sticky. |
| `getPostBySlug(slug)` | One post with sanitized content, TOC and SEO data. Returns `null` if not found. |
| `getCategories()` | All categories with at least one post |
| `getCategoryBySlug(slug)` | One category by slug, or `null` |
| `getFeaturedPost()` | Sticky post, or the latest post |
| `getRelatedPosts(categoryId, postId)` | 3 posts from the same category, without the current post |
| `getAllPostsForSitemap()` | Slug, modified date and categories of every post, for the sitemap |
| `getPostUrl(post)` | Builds `/blog/[category]/[slug]` for a post |

Raw WordPress responses are turned into small, clean objects (`Post`, `PostDetail`, `Category`) before they reach any component.

### `utils/formatters.ts`

| Function | Description |
| --- | --- |
| `decodeEntities` | Turns `&#8217;`, `&amp;`, `&#038;` into normal characters |
| `stripTags` / `cleanText` | Removes HTML tags and decodes text |
| `cleanExcerpt` | Clean excerpt without `<p>` tags or `[...]`, cut to 160 characters |
| `formatDate` | Formats dates like `Oct 12, 2024` |
| `getReadingTime` | Reading time in minutes (200 words per minute) |
| `sanitizeContent` | Cleans post HTML with `sanitize-html` |
| `addHeadingIds` | Adds ids to `h2` / `h3` tags and returns the TOC list |

### `types/wordpress.ts`

Interfaces for the raw API data (`WPPost`, `WPCategory`, `WPAuthor`, `WPMedia`, `WPTerm`, `YoastHeadJson`) and for the cleaned app data (`Post`, `PostDetail`, `Category`, `Author`, `FeaturedImage`, `SeoData`, `TocItem`, `PaginatedPosts`).

## Caching and Revalidation

- Every WordPress fetch uses `cache: "force-cache"` with `next: { revalidate: 3600, tags: ["wordpress"] }`.
- Blog pages export `revalidate = 3600`, so content is refreshed at most once an hour (ISR).
- `generateStaticParams` builds all category pages and the latest 10 posts at build time. Other posts are built on their first visit and then cached.
- The `wordpress` tag can be used with `revalidateTag("wordpress")` to refresh content on demand.

## SEO

Metadata is created with the Next.js Metadata API using `generateMetadata()`.

### Article pages

Metadata comes from the Yoast `yoast_head_json` fields of each post:

- `<title>` and meta description
- Robots meta (index / follow)
- Canonical URL pointing to this site
- Open Graph tags: title, description, image, type, published and modified time, author
- Twitter card tags: card type, title, description, image

### Blog and category pages

- Each page has its own title, description and canonical URL
- Yoast data for categories on this WordPress site only has a generic title like "Baby Care Archives - Baby Md" and no description, so cleaner values are used instead

### Other SEO work

- HTML entities are decoded, so codes like `&amp;` never appear in titles or the browser tab
- `/blog/sitemap.xml` lists all posts and categories with last modified dates
- One H1 per page, breadcrumb navigation and alt text on images
- Images use `next/image` with `sizes`, and the main image loads with `priority`

### Not included

- JSON-LD structured data (Article schema)
- `robots.txt`

These are not part of the assignment requirements.

## Loading, Error and 404 Handling

- `blog/loading.tsx` shows skeleton cards while data loads.
- `blog/error.tsx` shows a friendly message with a "Try again" button if WordPress fails.
- `blog/[category]/[slug]/not-found.tsx` is shown for missing articles.
- `app/not-found.tsx` is shown for missing categories and any other unknown page.
- API routes return JSON errors with `404` or `500` status codes.

## Architectural Decisions

- **Server Components by default.** Only `ShareButtons` (needs the clipboard) and `error.tsx` (required by Next.js) are Client Components. Search is a normal GET form, so it works without client JavaScript.
- **One data layer.** All WordPress calls go through `utils/wordpress.ts`. Pages call it directly, and the API routes reuse the same functions, so data is cleaned in one place.
- **Retry on server errors.** The WordPress server sometimes returns 500 when it gets many requests at once (for example during the build), so each fetch retries once after a short wait.
- **Featured image fallback.** Most posts on this WordPress site have no featured media set. The image is taken from embedded media first, then the Yoast `og_image`, then the first image in the content. If none of these exist, a placeholder is shown.
- **Featured post.** Uses the sticky post if there is one, otherwise the latest post. It is left out of the grid so it does not show twice.
- **Safe HTML.** Post content is sanitized with `sanitize-html` before rendering. Only safe tags are kept, and only YouTube and Vimeo iframes are allowed.
- **Category check on articles.** An article only opens under a category it belongs to, otherwise a 404 is shown.
- **Smooth scrolling** for the table of contents is done with CSS (`scroll-behavior: smooth`), so no extra JavaScript is needed.

## Known Notes

- The Yoast data on this WordPress site has `noindex` set, and the article pages pass that to the robots meta tag as it is.
- Because `blog/loading.tsx` streams the page, `notFound()` shows the 404 page but the HTTP status stays 200 (Next.js adds a `noindex` tag instead). This is expected Next.js behavior when streaming. The API routes return a real 404.
- Some category names (like "parenting" and "vaccination") are lowercase because that is how they are saved in WordPress.

## Deployment

The app can be deployed to Vercel:

1. Push the code to a GitHub repository.
2. Import the repository in Vercel.
3. Add the environment variables `NEXT_PUBLIC_WORDPRESS_API_URL` and `NEXT_PUBLIC_SITE_URL` (set this to the Vercel URL).
4. Deploy.
