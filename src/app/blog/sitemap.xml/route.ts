import { getAllPostsForSitemap, getCategories } from "@/utils/wordpress";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function urlEntry(path: string, lastModified?: string): string {
  const lastmod = lastModified ? `<lastmod>${new Date(lastModified).toISOString()}</lastmod>` : "";
  return `<url><loc>${SITE_URL}${path}</loc>${lastmod}</url>`;
}

export async function GET() {
  const [posts, categories] = await Promise.all([getAllPostsForSitemap(), getCategories()]);

  const entries = [
    urlEntry("/blog"),
    ...categories.map((category) => urlEntry(`/blog/${category.slug}`)),
    ...posts.map((post) => {
      const category = categories.find((c) => c.id === post.categories[0])?.slug ?? "uncategorized";
      return urlEntry(`/blog/${category}/${post.slug}`, post.modified);
    }),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
