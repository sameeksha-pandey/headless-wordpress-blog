import { NextResponse, type NextRequest } from "next/server";
import { getCategoryBySlug, getPosts } from "@/utils/wordpress";

// GET /api/posts?page=1&limit=10&category=baby-care&search=sleep
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 10));
  const category = params.get("category");
  const search = params.get("search") ?? undefined;

  try {
    let categoryId: number | undefined;

    // category can be an ID or a slug
    if (category) {
      if (/^\d+$/.test(category)) {
        categoryId = Number(category);
      } else {
        const found = await getCategoryBySlug(category);
        if (!found) {
          return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }
        categoryId = found.id;
      }
    }

    const result = await getPosts({ page, limit, categoryId, search });
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
