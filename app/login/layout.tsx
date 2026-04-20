import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff Login | Neel Orthopaedic HMS",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}