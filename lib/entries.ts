import { sql } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

export type Entry = {
  id: string;
  name: string;
  message: string;
  created_at: string;
};

export type EntryValidationError =
  | "empty_name"
  | "empty_message"
  | "empty_password"
  | "name_too_long"
  | "message_too_long";

export const MAX_NAME_LENGTH = 20;
export const MAX_MESSAGE_LENGTH = 300;

export function validateEntry(
  name: string,
  message: string,
  password: string,
): EntryValidationError | null {
  if (!name.trim()) return "empty_name";
  if (name.length > MAX_NAME_LENGTH) return "name_too_long";
  if (!message.trim()) return "empty_message";
  if (message.length > MAX_MESSAGE_LENGTH) return "message_too_long";
  if (!password) return "empty_password";
  return null;
}

export function validateMessage(message: string): "empty_message" | "message_too_long" | null {
  if (!message.trim()) return "empty_message";
  if (message.length > MAX_MESSAGE_LENGTH) return "message_too_long";
  return null;
}

export async function listEntries(): Promise<Entry[]> {
  return (await sql`
    select id, name, message, created_at from entries order by created_at desc
  `) as Entry[];
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
