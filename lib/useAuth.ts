"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  name: string;
}

const ROLE_ACCESS: Record<string, string[]> = {
  doctor:    ["/doctor", "/ipd", "/dashboard", "/patient-history", "/prescription"],
  admin:     ["/admin", "/dashboard", "/stock"],
  staff:     ["/rooms", "/stock", "/ipd", "/patient-history"],
  reception: ["/reception", "/rooms", "/walkin", "/token", "/prescription", "/patient-history"],
};

export function useAuth(requiredPage?: string) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role, name")
        .eq("user_id", session.user.id)
        .single();

      if (!roleData) {
        router.push("/login");
        return;
      }

      if (requiredPage) {
        const allowedPages = ROLE_ACCESS[roleData.role] || [];
        const canAccess = allowedPages.some(p => requiredPage.startsWith(p));
        if (!canAccess) {
          router.push("/unauthorized");
          return;
        }
      }

      setUser({
        id: session.user.id,
        email: session.user.email || "",
        role: roleData.role,
        name: roleData.name,
      });
      setLoading(false);
    };

    checkAuth();
  }, [router, requiredPage]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return { user, loading, signOut };
}

export { supabase };