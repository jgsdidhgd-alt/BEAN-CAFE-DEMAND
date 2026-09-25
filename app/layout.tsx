import "./globals.css";
import Link from "next/link";
import { ensureAdmin } from "../lib/seed";

export const metadata={title:"DemandHub",description:"Customer demand management platform"};

export default async function Layout({children}:{children:React.ReactNode}){
  await ensureAdmin();
  return <><nav className="nav"><Link href="/" className="brand">DemandHub</Link><div className="links"><Link href="/customer">Customer</Link><Link href="/admin">Admin</Link></div></nav>{children}<footer className="footer">DemandHub © 2026</footer></>;
}
