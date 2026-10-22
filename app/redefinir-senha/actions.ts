"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UpdatePasswordState = { error?: string } | null;

export async function updatePassword(_previous: UpdatePasswordState, formData: FormData): Promise<UpdatePasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };
  if (password !== confirm) return { error: "As senhas não conferem." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "O link expirou. Solicite uma nova recuperação." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("Erro ao atualizar senha:", error.message);
    return { error: "Não foi possível atualizar a senha. Solicite um novo link." };
  }
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
