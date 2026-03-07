import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const getSession = async () => {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};

export const requireAuth = async () => {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
};

export const isAdmin = async (userId: string) => {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", userId).single();
  return Boolean(data?.is_admin);
};
