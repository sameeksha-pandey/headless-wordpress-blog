import { decode } from "html-entities";
import sanitizeHtml from "sanitize-html";
import type { TocItem } from "@/types/wordpress";

const WORDS_PER_MINUTE = 200;

// Turns codes like &#8217; and &amp; into normal characters
export function decodeEntities(text: string): string {
  return decode(text);
}

export function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function cleanText(html: string): string {
  return decodeEntities(stripTags(html));
}

export function cleanExcerpt(html: string, maxLength = 160): string {
  const text = cleanText(html).replace(/\[…\]|\[\.\.\.\]/g, "").trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "...";
}

// Example output: "Oct 12, 2024"
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function getReadingTime(html: string): number {
  const words = stripTags(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "figure",
      "figcaption",
      "iframe",
      "h1",
      "h2",
    ]),
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "srcset", "sizes", "alt", "width", "height", "loading"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "title"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
    transformTags: {
      img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }),
    },
  });
}

// Adds ids to h2 and h3 tags so the table of contents can link to them
export function addHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const usedIds: Record<string, number> = {};

  const result = html.replace(
    /<h([23])>([\s\S]*?)<\/h\1>/g,
    (_match, level: string, inner: string) => {
      const text = cleanText(inner);
      let id = slugify(text) || "section";

      if (usedIds[id]) {
        usedIds[id] += 1;
        id = `${id}-${usedIds[id]}`;
      } else {
        usedIds[id] = 1;
      }

      toc.push({ id, text, level: level === "2" ? 2 : 3 });
      return `<h${level} id="${id}">${inner}</h${level}>`;
    }
  );

  return { html: result, toc };
}
