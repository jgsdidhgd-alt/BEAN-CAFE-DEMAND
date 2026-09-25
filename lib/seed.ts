import bcrypt from "bcryptjs";
import { ensureDatabase, query } from "./db";

export async function ensureAdmin() {
  await ensureDatabase();
  const existing = await query(`SELECT id FROM users WHERE email=$1`, ["admin@demandhub.local"]);
  if (existing.rowCount === 0) {
    await query(
      `INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,'admin')`,
      ["Administrator", "admin@demandhub.local", bcrypt.hashSync("admin123", 10)]
    );
  }
}
