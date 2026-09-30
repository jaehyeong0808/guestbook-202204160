import { NextRequest, NextResponse } from "next/server";
import { createEntry, listEntries, validateEntry } from "@/lib/entries";

export async function GET() {
  const entries = await listEntries();
  return NextResponse.json({ entries });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { name, message, password } = body as Record<string, unknown>;
  if (typeof name !== "string" || typeof message !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const error = validateEntry(name, message, password);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const id = await createEntry(name.trim(), message.trim(), password);
  return NextResponse.json({ id }, { status: 201 });
}
