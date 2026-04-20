import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reception | Neel Orthopaedic HMS",
};

export default function ReceptionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}