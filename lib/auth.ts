import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { ensureDatabase, query } from "./db";

export type User = { id: number; name: string; email: string; role: "admin" | "customer" };

export async function currentUser(): Promise<User | null> {
  await ensureDatabase();
  const token = cookies().get("dh_session")?.value;
  if (!token) return null;
  const result = await query<User>(
    `SELECT u.id, u.name, u.email, u.role
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = $1 AND s.expires_at > NOW()` , [token]
  );
  return result.rows[0] ?? null;
}

export async function createSession(userId: number) {
  await ensureDatabase();
  const token = randomBytes(32).toString("hex");
  await query(`DELETE FROM sessions WHERE expires_at <= NOW()`);
  await query(`INSERT INTO sessions(id,user_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '30 days')`, [token, userId]);
  return token;
}

export async function deleteSession(token: string | undefined) {
  if (!token) return;
  await query(`DELETE FROM sessions WHERE id=$1`, [token]);
}
