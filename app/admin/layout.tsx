import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal | Neel Orthopaedic HMS",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}