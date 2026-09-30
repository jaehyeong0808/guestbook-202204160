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
