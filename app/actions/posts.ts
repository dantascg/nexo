"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleLike(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");
  const redirectPath = String(formData.get("redirectPath") ?? "/inicio");
  if (!postId) return;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: existing } = await supabase.from("post_likes").select("post_id").eq("post_id", postId).eq("user_id", user.id).maybeSingle();
  if (existing) await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
  else await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
  revalidatePath(redirectPath);
}

export async function createComment(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const redirectPath = String(formData.get("redirectPath") ?? "/inicio");
  if (!postId || !body || body.length > 2000) return;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("comments").insert({ post_id: postId, author_id: user.id, body });
  revalidatePath(redirectPath);
}
