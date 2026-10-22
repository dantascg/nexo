"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function joinCommunity(formData: FormData) {
  const communityId = String(formData.get("communityId") ?? "");
  if (!communityId) return;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("community_members").insert({ community_id: communityId, user_id: user.id });
  if (error && error.code !== "23505") console.error("Erro ao entrar na comunidade:", error.message);
  revalidatePath("/comunidades");
}

export async function leaveCommunity(formData: FormData) {
  const communityId = String(formData.get("communityId") ?? "");
  if (!communityId) return;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("community_members").delete().eq("community_id", communityId).eq("user_id", user.id);
  if (error) console.error("Erro ao sair da comunidade:", error.message);
  revalidatePath("/comunidades");
}
