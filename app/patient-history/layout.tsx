import type { Metadata } from "next";
export const metadata: Metadata = { title: "Patient History | Neel Orthopaedic HMS" };
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }