import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Doctor Portal | Neel Orthopaedic HMS",
};

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}