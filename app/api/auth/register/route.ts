import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureDatabase } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req:Request){
  await ensureDatabase();
  const {name,email,password}=await req.json();
  const normalized=String(email||"").trim().toLowerCase();
  if(!name||!normalized||!password||password.length<6) return NextResponse.json({error:"Name, email and 6+ character password required"},{status:400});
  try{
    const r=await query<any>(`INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,'customer') RETURNING id`,[name.trim(),normalized,bcrypt.hashSync(password,10)]);
    const token=await createSession(Number(r.rows[0].id));
    const res=NextResponse.json({ok:true});
    res.cookies.set("dh_session",token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*30});
    return res;
  }catch(e){return NextResponse.json({error:"Email already registered"},{status:409});}
}
