import {NextResponse} from "next/server";
import { currentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function PATCH(req:Request,{params}:{params:{id:string}}){
  const u=await currentUser();
  if(!u||u.role!=="admin")return NextResponse.json({error:"Unauthorized"},{status:401});
  const x=await req.json();
  const allowed=["Pending","In Progress","Completed","Rejected"];
  if(!allowed.includes(x.status))return NextResponse.json({error:"Invalid status"},{status:400});
  const r=await query(`UPDATE demands SET status=$1,response=$2 WHERE id=$3`,[x.status,x.response||"",Number(params.id)]);
  if(r.rowCount===0)return NextResponse.json({error:"Demand not found"},{status:404});
  return NextResponse.json({ok:true});
}
