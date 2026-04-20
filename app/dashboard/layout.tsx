import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Neel Orthopaedic HMS",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}