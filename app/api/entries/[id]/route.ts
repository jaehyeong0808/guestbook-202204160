import { NextRequest, NextResponse } from "next/server";
import { deleteEntry, updateEntryMessage } from "@/lib/entries";

function statusFor(result: "not_found" | "wrong_password" | "ok") {
  if (result === "not_found") return 404;
  if (result === "wrong_password") return 403;
  return 200;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { message, password } = body as Record<string, unknown>;
  if (typeof message !== "string" || typeof password !== "string" || !message.trim() || !password) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const result = await updateEntryMessage(id, message.trim(), password);
  if (result !== "ok") {
    return NextResponse.json({ error: result }, { status: statusFor(result) });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const password = (body as Record<string, unknown> | null)?.password;
  if (typeof password !== "string" || !password) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const result = await deleteEntry(id, password);
  if (result !== "ok") {
    return NextResponse.json({ error: result }, { status: statusFor(result) });
  }
  return NextResponse.json({ ok: true });
}
