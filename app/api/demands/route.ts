import {NextResponse} from "next/server";
import { currentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(){
  const u=await currentUser();
  if(!u)return NextResponse.json({error:"Unauthorized"},{status:401});
  const rows=u.role==="admin"
    ? (await query(`SELECT d.*,u.name customer_name,u.email customer_email FROM demands d JOIN users u ON u.id=d.customer_id ORDER BY d.id DESC`)).rows
    : (await query(`SELECT * FROM demands WHERE customer_id=$1 ORDER BY id DESC`,[u.id])).rows;
  return NextResponse.json(rows);
}

export async function POST(req:Request){
  const u=await currentUser();
  if(!u||u.role!=="customer")return NextResponse.json({error:"Unauthorized"},{status:401});
  const x=await req.json();
  if(!x.product||!x.quantity||!x.location||!x.details)return NextResponse.json({error:"Required fields missing"},{status:400});
  const r=await query<any>(`INSERT INTO demands(customer_id,product,quantity,budget,location,required_date,details) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,[u.id,x.product,Number(x.quantity),x.budget||"",x.location,x.requiredDate||"",x.details]);
  return NextResponse.json({id:r.rows[0].id});
}
