"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import styles from "../styles/auth.module.css";
import { signUp } from "../login/actions";

// Medidor simples de força da senha (só visual, o servidor valida de novo).
function strength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { label: "Fraca", color: "#b42318", pct: 33 };
  if (score <= 3) return { label: "Média", color: "#c89d3c", pct: 66 };
  return { label: "Forte", color: "#1a7f4b", pct: 100 };
}

export default function CadastroPage() {
  const [state, action, pending] = useActionState(signUp, null);
  const [pw, setPw] = useState("");
  const s = strength(pw);

  return (
    <div className={styles.page}>
      <section className={styles.intro}>
        <div className={styles.logo}>nexo <span>escolar</span></div>
        <div>
          <h1>Entre na<br /><span style={{ color: "#ef6f58" }}>sua escola.</span></h1>
          <p>Crie sua conta em segundos e comece a acompanhar agenda, comunidades e novidades da turma.</p>
        </div>
        <div className={styles.features}>
          <div className={styles.feature}>◉　Seus dados protegidos<br /><small>Senhas nunca ficam salvas em texto puro</small></div>
          <div className={styles.feature}>♧　Comunidades escolares<br /><small>Colabore com colegas e professores</small></div>
        </div>
      </section>
      <section className={styles.content}>
        <div className={styles.card}>
          <h2>Criar conta</h2>
          <p className={styles.muted}>Preencha para acessar o Nexo Escolar</p>
          <form className={styles.form} action={action}>
            <label className={styles.label}>Nome completo
              <input className={styles.input} name="name" type="text" autoComplete="name" defaultValue={state?.name ?? ""} placeholder="Seu nome" />
            </label>
            <label className={styles.label}>E-mail
              <input className={styles.input} name="email" type="email" autoComplete="email" defaultValue={state?.email ?? ""} placeholder="nome@escola.edu.br" />
            </label>
            <label className={styles.label}>Senha
              <input className={styles.input} name="password" type="password" autoComplete="new-password" placeholder="Mínimo de 8 caracteres" value={pw} onChange={(e) => setPw(e.target.value)} />
              {pw && (
                <span style={{ display: "grid", gap: 4 }}>
                  <span style={{ height: 5, borderRadius: 3, background: "#e5e9ee", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: `${s.pct}%`, background: s.color, transition: "width .2s" }} />
                  </span>
                  <small style={{ color: s.color, fontWeight: 600 }}>Senha {s.label.toLowerCase()}</small>
                </span>
              )}
            </label>
            <label className={styles.label}>Confirmar senha
              <input className={styles.input} name="confirm" type="password" autoComplete="new-password" placeholder="Repita a senha" />
            </label>
            {state?.error && <div className={styles.error}>{state.error}</div>}
            {state?.info && (
              <div className={styles.error} style={{ color: "#1a7f4b", background: "#effaf3", borderColor: "#b7e4c7" }}>{state.info}</div>
            )}
            <button className={styles.submit} disabled={pending}>{pending ? "Criando…" : "Criar conta"}</button>
          </form>
          <p className={styles.muted} style={{ textAlign: "center", marginTop: 24 }}>
            Já tem conta?{" "}
            <Link href="/login" style={{ color: "#ef6f58", fontWeight: 700 }}>Entrar</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
