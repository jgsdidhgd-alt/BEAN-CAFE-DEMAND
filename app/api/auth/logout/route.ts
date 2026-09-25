import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/auth";
export async function POST(){
  const token=cookies().get("dh_session")?.value;
  await deleteSession(token);
  const r=NextResponse.json({ok:true});
  r.cookies.set("dh_session","",{httpOnly:true,path:"/",maxAge:0});
  return r;
}
