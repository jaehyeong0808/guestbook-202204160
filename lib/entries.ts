import { sql } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { Entry, EntryStats } from "@/lib/entry-rules";

export type { Entry, EntryStats, EntryValidationError } from "@/lib/entry-rules";
export { MAX_NAME_LENGTH, MAX_MESSAGE_LENGTH, validateEntry, validateMessage } from "@/lib/entry-rules";

export async function listEntries(): Promise<Entry[]> {
  return (await sql`
    select id, name, message, like_count, created_at from entries order by created_at desc
  `) as Entry[];
}

export async function getEntryStats(): Promise<EntryStats> {
  const rows = (await sql`
    select
      count(*)::int as total,
      count(*) filter (where created_at >= date_trunc('day', now()))::int as today
    from entries
  `) as EntryStats[];
  return rows[0] ?? { total: 0, today: 0 };
}

export async function likeEntry(id: string): Promise<number | null> {
  const rows = (await sql`
    update entries set like_count = like_count + 1 where id = ${id} returning like_count
  `) as { like_count: number }[];
  return rows[0]?.like_count ?? null;
}

export async function createEntry(
  name: string,
  message: string,
  password: string,
): Promise<string> {
  const passwordHash = hashPassword(password);
  const rows = (await sql`
    insert into entries (name, message, password_hash)
    values (${name}, ${message}, ${passwordHash})
    returning id
  `) as { id: string }[];
  return rows[0].id;
}

async function getPasswordHash(id: string): Promise<string | null> {
  const rows = (await sql`
    select password_hash from entries where id = ${id}
  `) as { password_hash: string }[];
  return rows[0]?.password_hash ?? null;
}

/**
 * Returns "not_found", "wrong_password", or "ok" so callers can tell apart
 * a missing entry from a rejected password without a second round trip.
 */
export async function updateEntryMessage(
  id: string,
  message: string,
  password: string,
): Promise<"not_found" | "wrong_password" | "ok"> {
  const passwordHash = await getPasswordHash(id);
  if (passwordHash === null) return "not_found";
  if (!verifyPassword(password, passwordHash)) return "wrong_password";
  await sql`update entries set message = ${message} where id = ${id}`;
  return "ok";
}

export async function deleteEntry(
  id: string,
  password: string,
): Promise<"not_found" | "wrong_password" | "ok"> {
  const passwordHash = await getPasswordHash(id);
  if (passwordHash === null) return "not_found";
  if (!verifyPassword(password, passwordHash)) return "wrong_password";
  await sql`delete from entries where id = ${id}`;
  return "ok";
}
