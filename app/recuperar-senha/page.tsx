"use client";

import { useActionState } from "react";
import Link from "next/link";
import styles from "../styles/auth.module.css";
import { requestPasswordReset } from "./actions";

export default function RecuperarSenhaPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);

  return <div className={styles.page}>
    <section className={styles.intro}><div className={styles.logo}>nexo <span>escolar</span></div><div><h1>Recupere o<br /><span style={{ color: "#ef6f58" }}>seu acesso.</span></h1><p>Enviaremos um link seguro para você criar uma nova senha.</p></div><div className={styles.features}><div className={styles.feature}>◉　Link temporário<br /><small>O acesso de recuperação expira por segurança</small></div><div className={styles.feature}>✓　Sem revelar contas<br /><small>A mesma mensagem aparece para qualquer e-mail</small></div></div></section>
    <section className={styles.content}><div className={styles.card}><h2>Esqueci minha senha</h2><p className={styles.muted}>Informe o e-mail usado no Nexo Escolar</p><form className={styles.form} action={action}><label className={styles.label}>E-mail<input className={styles.input} name="email" type="email" autoComplete="email" placeholder="nome@escola.edu.br" required /></label>{state?.error && <div className={styles.error}>{state.error}</div>}{state?.info && <div className={styles.error} style={{ color: "#1a7f4b", background: "#effaf3", borderColor: "#b7e4c7" }}>{state.info}</div>}<button className={styles.submit} disabled={pending}>{pending ? "Enviando…" : "Enviar link de recuperação"}</button></form><p className={styles.muted} style={{ textAlign: "center", marginTop: 24 }}><Link href="/login" style={{ color: "#ef6f58", fontWeight: 700 }}>Voltar para o login</Link></p></div></section>
  </div>;
}
