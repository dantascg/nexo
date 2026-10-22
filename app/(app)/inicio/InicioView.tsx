"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useUser } from "../../components/UserProvider";
import type { HomeEvent, HomePost } from "../../../lib/home";
import { createClient } from "../../../lib/supabase/client";
import { publishPost, savePost, type PublishState } from "./actions";
import { createComment, toggleLike } from "@/app/actions/posts";
import styles from "../../styles/dashboard.module.css";

function formatEvent(event: HomeEvent) {
  const date = new Date(event.startsAt);
  return {
    day: date.toLocaleDateString("pt-BR", { day: "2-digit" }),
    month: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase(),
    time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function formatRole(role: string) {
  return role === "teacher" ? "Professor" : role === "staff" ? "Equipe escolar" : "Aluno";
}

function PublishButton() {
  const { pending } = useFormStatus();
  return <button className={styles.publish} type="submit" disabled={pending}>{pending ? "Publicando…" : "Publicar"} <Send /></button>;
}

export default function InicioView({ posts, events }: { posts: HomePost[]; events: HomeEvent[] }) {
  const user = useUser();
  const router = useRouter();
  const [state, action] = useActionState<PublishState, FormData>(publishPost, null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("home-posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return <div className={styles.page}>
    <main>
      <header className={styles.header}><div><div className={styles.eyebrow}>Colégio Horizonte</div><h1 className={styles.title}>Bom dia, {user.firstName}</h1></div><div className={styles.actions}><div className={styles.search}><Search />Buscar na escola</div><button className={styles.iconBtn} type="button" aria-label="Notificações"><Bell /></button></div></header>
      <div className={styles.sectionHead}><span className={styles.sectionTitle}>Atualizações</span></div>
      <form className={`${styles.card} ${styles.composer}`} action={action}>
        <div className={styles.composerTop}><div className={styles.avatar} style={{ background: "#ef6f58" }}>{user.initials}</div><textarea className={styles.textarea} name="body" rows={2} maxLength={5000} placeholder="Compartilhe uma ideia, dúvida ou conquista..." /></div>
        <div className={styles.composerBottom}><div className={styles.composerTools}><button className={styles.tool} type="button"><ImageIcon />Imagem</button><button className={styles.tool} type="button"><FileIcon />Arquivo</button></div><PublishButton /></div>
        {state?.error && <div className={styles.error}>{state.error}</div>}
        {state?.success && <div className={styles.success}>Publicação enviada.</div>}
      </form>
      {posts.length ? posts.map((post) => <PostCard key={post.id} post={post} />) : <div className={`${styles.card} ${styles.empty}`}>Ainda não há publicações. Seja a primeira pessoa a compartilhar algo.</div>}
    </main>
    <aside className={styles.right}><div className={`${styles.card} ${styles.rightCard}`}><div className={styles.rightHeader}><span className={styles.rightTitle}>Próximos eventos</span><span className={styles.muted}>{events.length}</span></div>{events.length ? events.map((event) => { const date = formatEvent(event); return <div className={styles.event} key={event.id}><div className={styles.date}><strong>{date.day}</strong><small>{date.month}</small></div><div><div className={styles.eventTitle}>{event.title}</div><div className={styles.eventMeta}>{date.time} · {event.location}</div></div></div>; }) : <div className={styles.muted}>Nenhum evento próximo.</div>}</div></aside>
  </div>;
}

function PostCard({ post }: { post: HomePost }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  return <article className={`${styles.card} ${styles.post}`}><div className={styles.postTop}><div className={styles.postUser}><div className={styles.avatar} style={{ background: "#4e82b8" }}>{post.authorInitials}</div><div><div className={styles.postName}>{post.authorName}</div><div className={styles.postRole}>{formatRole(post.authorRole)} · {formatRelative(post.createdAt)}</div></div></div></div><p className={styles.postBody}>{post.body}</p><div className={styles.postFooter}><form action={toggleLike}><input type="hidden" name="postId" value={post.id} /><input type="hidden" name="redirectPath" value="/inicio" /><button className={styles.postAction} type="submit">♡ {post.likeCount}</button></form><button className={styles.postAction} type="button" onClick={() => setCommentsOpen((open) => !open)}>◌ {post.commentCount}</button>{post.isSaved ? <span className={`${styles.postAction} ${styles.save}`}>▮ Salvo</span> : <form className={styles.save} action={savePost}><input type="hidden" name="postId" value={post.id} /><button className={styles.postAction} type="submit">▮ Salvar</button></form>}</div>{commentsOpen && <form style={{ display: "flex", gap: 8, marginTop: 12, borderTop: "1px solid #edf0f3", paddingTop: 12 }} action={createComment}><input type="hidden" name="postId" value={post.id} /><input type="hidden" name="redirectPath" value="/inicio" /><input style={{ flex: 1, border: "1px solid #dbe3ea", borderRadius: 7, padding: 8, fontSize: 11 }} name="body" maxLength={2000} placeholder="Escreva um comentário..." required /><button style={{ border: 0, borderRadius: 7, background: "#102541", color: "#fff", padding: "0 12px", fontSize: 10 }} type="submit">Enviar</button></form>}</article>;
}

function formatRelative(value: string) {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  return `há ${Math.floor(hours / 24)} d`;
}

function Search() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4-4" /></svg>; }
function Bell() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4" /></svg>; }
function ImageIcon() { return <span>▧</span>; }
function FileIcon() { return <span>¤</span>; }
function Send() { return <span>➤</span>; }
