"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type PasswordResetState = { error?: string; info?: string } | null;

function getOrigin(requestHeaders: Headers) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export async function requestPasswordReset(_previous: PasswordResetState, formData: FormData): Promise<PasswordResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) return { error: "Informe um e-mail válido." };

  const origin = getOrigin(await headers());
  const redirectTo = `${origin}/auth/confirm?next=${encodeURIComponent("/redefinir-senha")}`;
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    console.error("Erro ao solicitar recuperação de senha:", error.message);
    return { error: "Não foi possível enviar o link agora. Tente novamente em instantes." };
  }
  return { info: "Se existir uma conta com esse e-mail, enviaremos um link de recuperação." };
}
