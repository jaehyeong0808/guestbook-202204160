import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const envContent = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = envContent.match(/DATABASE_URL=(.+)/)[1].trim();

const sql = neon(url);
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const stmt of statements) {
  await sql.query(stmt);
  console.log("OK:", stmt.slice(0, 60));
}
