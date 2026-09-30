import { NextResponse } from "next/server";
import { likeEntry } from "@/lib/entries";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const likeCount = await likeEntry(id);
  if (likeCount === null) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ like_count: likeCount });
}
