"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function removeSavedItem(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");
  if (!postId) return;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from("saved_items").delete().eq("user_id", user.id).eq("post_id", postId);
  if (error) console.error("Erro ao remover item salvo:", error.message);
  revalidatePath("/salvos");
  revalidatePath("/inicio");
}
