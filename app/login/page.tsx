"use client";
import { useActionState } from "react";
import Link from "next/link";
import styles from "../styles/auth.module.css";
import { signIn } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <div className={styles.page}>
      <section className={styles.intro}>
        <div className={styles.logo}>nexo <span>escolar</span></div>
        <div>
          <h1>Sua escola,<br /><span style={{ color: "#ef6f58" }}>conectada.</span></h1>
          <p>Organize sua rotina escolar, conecte-se com sua turma e acompanhe tudo em um só lugar.</p>
        </div>
        <div className={styles.features}>
          <div className={styles.feature}>▣　Agenda inteligente<br /><small>Nunca perca um prazo importante</small></div>
          <div className={styles.feature}>♧　Comunidades escolares<br /><small>Colabore com colegas e professores</small></div>
        </div>
      </section>
      <section className={styles.content}>
        <div className={styles.card}>
          <h2>Bem-vindo de volta</h2>
          <p className={styles.muted}>Acesse sua conta do Nexo Escolar</p>
          <form className={styles.form} action={action}>
            <label className={styles.label}>E-mail
              <input className={styles.input} name="email" type="email" autoComplete="email" defaultValue={state?.email ?? ""} placeholder="nome@escola.edu.br" />
            </label>
            <label className={styles.label}>Senha
              <input className={styles.input} name="password" type="password" autoComplete="current-password" placeholder="••••••••" />
            </label>
            <Link href="/recuperar-senha" style={{ color: "#3e6d9d", fontSize: 12, textAlign: "right", marginTop: -8 }}>Esqueci minha senha</Link>
            {state?.error && <div className={styles.error}>{state.error}</div>}
            <button className={styles.submit} disabled={pending}>{pending ? "Entrando…" : "Entrar na conta"}</button>
          </form>
          <p className={styles.muted} style={{ textAlign: "center", marginTop: 24 }}>
            Primeiro acesso?{" "}
            <Link href="/cadastro" style={{ color: "#ef6f58", fontWeight: 700 }}>Crie sua conta</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
