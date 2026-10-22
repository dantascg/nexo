"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = {
  error?: string;
  info?: string;
  name?: string;
  email?: string;
} | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Confere se a senha já apareceu em vazamentos conhecidos, SEM enviar a senha.
// Só os 5 primeiros caracteres do hash SHA-1 saem daqui (técnica k-anonymity, API Pwned Passwords).
async function isPwned(password: string): Promise<boolean> {
  try {
    const hash = createHash("sha1").update(password).digest("hex").toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return false;
    const text = await res.text();
    return text.split("\n").some((line) => {
      const [s, count] = line.trim().split(":");
      return s === suffix && Number(count) > 0;
    });
  } catch {
    return false; // se a API estiver fora, não trava o cadastro
  }
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Preencha todos os campos.", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // Mensagem genérica de propósito: não revela se o e-mail existe ou não.
  if (error) return { error: "E-mail ou senha incorretos.", email };

  redirect("/inicio");
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (name.length < 2) return { error: "Informe seu nome.", name, email };
  if (!EMAIL_RE.test(email)) return { error: "E-mail inválido.", name, email };
  if (password.length < 8)
    return { error: "A senha precisa ter pelo menos 8 caracteres.", name, email };
  if (password !== confirm) return { error: "As senhas não conferem.", name, email };
  if (await isPwned(password))
    return {
      error: "Essa senha já apareceu em vazamentos de dados. Escolha outra, mais única.",
      name,
      email,
    };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    console.error("signUp error:", error.message, error.status);
    return {
      error: "Não foi possível criar a conta. Se você já tem cadastro, entre pela tela de login.",
      name,
      email,
    };
  }

  // Se a confirmação por e-mail estiver ligada no Supabase, não vem sessão ainda.
  if (!data.session) {
    return { info: "Conta criada! Confirme seu e-mail para poder entrar.", name, email };
  }

  redirect("/inicio");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
