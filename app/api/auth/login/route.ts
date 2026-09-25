import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureAdmin } from "@/lib/seed";
import { createSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req:Request){
  await ensureAdmin();
  const {email,password}=await req.json();
  const result=await query<any>(`SELECT * FROM users WHERE email=$1`,[String(email||"").trim().toLowerCase()]);
  const u=result.rows[0];
  if(!u||!bcrypt.compareSync(password||"",u.password_hash)) return NextResponse.json({error:"Invalid email or password"},{status:401});
  const token=await createSession(Number(u.id));
  const res=NextResponse.json({user:{id:u.id,name:u.name,email:u.email,role:u.role}});
  res.cookies.set("dh_session",token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*30});
  return res;
}
