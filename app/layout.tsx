import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Nexo Escolar – Conectando sua escola", description: "Plataforma escolar completa para alunos, professores e comunidades escolares." };
export default function RootLayout({ children }: LayoutProps<"/">) { return <html lang="pt-BR"><body>{children}</body></html>; }
