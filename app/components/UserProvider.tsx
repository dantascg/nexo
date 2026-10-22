"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { AppUser } from "@/lib/auth";

const UserContext = createContext<AppUser | null>(null);

export function UserProvider({ user, children }: { user: AppUser; children: ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

// Use em qualquer componente de cliente dentro do app logado: const user = useUser()
export function useUser(): AppUser {
  const user = useContext(UserContext);
  if (!user) throw new Error("useUser precisa estar dentro de <UserProvider>");
  return user;
}
