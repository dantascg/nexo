"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PublishState = { error?: string; success?: boolean } | null;

export async function publishPost(_previous: PublishState, formData: FormData): Promise<PublishState> {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Escreva algo antes de publicar." };
  if (body.length > 5000) return { error: "A publicação pode ter no máximo 5.000 caracteres." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sua sessão expirou. Entre novamente." };

  const { error } = await supabase.from("posts").insert({ author_id: user.id, body });
  if (error) {
    console.error("Erro ao publicar post:", error.message);
    return { error: "Não foi possível publicar agora." };
  }

  revalidatePath("/inicio");
  return { success: true };
}
