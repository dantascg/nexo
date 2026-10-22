"use client";

import { useActionState } from "react";
import Link from "next/link";
import styles from "../styles/auth.module.css";
import { updatePassword } from "./actions";

export default function RedefinirSenhaPage() {
  const [state, action, pending] = useActionState(updatePassword, null);

  return <div className={styles.page}>
    <section className={styles.intro}><div className={styles.logo}>nexo <span>escolar</span></div><div><h1>Crie uma<br /><span style={{ color: "#ef6f58" }}>nova senha.</span></h1><p>Escolha uma senha nova e exclusiva para proteger sua conta.</p></div><div className={styles.features}><div className={styles.feature}>✓　Pelo menos 8 caracteres<br /><small>Combine letras, números e símbolos</small></div></div></section>
    <section className={styles.content}><div className={styles.card}><h2>Nova senha</h2><p className={styles.muted}>Defina a senha que você usará daqui em diante</p><form className={styles.form} action={action}><label className={styles.label}>Nova senha<input className={styles.input} name="password" type="password" autoComplete="new-password" placeholder="Mínimo de 8 caracteres" required /></label><label className={styles.label}>Confirmar nova senha<input className={styles.input} name="confirm" type="password" autoComplete="new-password" placeholder="Repita a nova senha" required /></label>{state?.error && <div className={styles.error}>{state.error}</div>}<button className={styles.submit} disabled={pending}>{pending ? "Salvando…" : "Salvar nova senha"}</button></form><p className={styles.muted} style={{ textAlign: "center", marginTop: 24 }}><Link href="/login" style={{ color: "#ef6f58", fontWeight: 700 }}>Voltar para o login</Link></p></div></section>
  </div>;
}
