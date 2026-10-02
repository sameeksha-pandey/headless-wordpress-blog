import { NextResponse } from "next/server";
import { getPostBySlug } from "@/utils/wordpress";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

// GET /api/posts/some-post-slug
export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;

  try {
    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}
