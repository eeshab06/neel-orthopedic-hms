import type { Metadata } from "next";
export const metadata: Metadata = { title: "About Us | Neel Orthopaedic HMS" };
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }