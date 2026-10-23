import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

export type HomePost = {
  id: string;
  body: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorInitials: string;
  likeCount: number;
  commentCount: number;
};

export type HomeEvent = {
  id: string;
  title: string;
  startsAt: string;
  location: string;
};

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts.at(-1)?.[0] ?? "")).toUpperCase();
}

function displayName(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "Usuário";
}

export async function getHomeData(): Promise<{ posts: HomePost[]; events: HomeEvent[] }> {
  // A data query based on the current time must opt out of prerendering.
  await connection();
  const supabase = await createClient();

  const [{ data: postRows, error: postsError }, { data: eventRows, error: eventsError }] =
    await Promise.all([
      supabase
        .from("posts")
        .select("id, body, created_at, author_id")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("events")
        .select("id, title, starts_at, location")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(5),
    ]);

  if (postsError) console.error("Erro ao carregar posts:", postsError.message);
  if (eventsError) console.error("Erro ao carregar eventos:", eventsError.message);

  const rows = (postRows ?? []) as Array<{
    id: string;
    body: string;
    created_at: string;
    author_id: string;
  }>;
  const postIds = rows.map((post) => post.id);
  const authorIds = [...new Set(rows.map((post) => post.author_id))];

  const [{ data: profiles }, { data: likes }, { data: comments }] = await Promise.all([
    authorIds.length
      ? supabase.from("profiles").select("id, full_name, role").in("id", authorIds)
      : Promise.resolve({ data: [] }),
    postIds.length
      ? supabase.from("post_likes").select("post_id").in("post_id", postIds)
      : Promise.resolve({ data: [] }),
    postIds.length
      ? supabase.from("comments").select("post_id").in("post_id", postIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profileById = new Map(
    ((profiles ?? []) as Array<{ id: string; full_name: string; role: string }>).map((profile) => [
      profile.id,
      profile,
    ])
  );
  const likeCounts = new Map<string, number>();
  const commentCounts = new Map<string, number>();

  for (const like of (likes ?? []) as Array<{ post_id: string }>) {
    likeCounts.set(like.post_id, (likeCounts.get(like.post_id) ?? 0) + 1);
  }
  for (const comment of (comments ?? []) as Array<{ post_id: string }>) {
    commentCounts.set(comment.post_id, (commentCounts.get(comment.post_id) ?? 0) + 1);
  }

  return {
    posts: rows.map((post) => {
      const profile = profileById.get(post.author_id);
      const authorName = displayName(profile?.full_name);
      return {
        id: post.id,
        authorId: post.author_id,
        body: post.body,
        createdAt: post.created_at,
        authorName,
        authorRole: profile?.role ?? "student",
        authorInitials: initials(authorName),
        likeCount: likeCounts.get(post.id) ?? 0,
        commentCount: commentCounts.get(post.id) ?? 0,
      };
    }),
    events: ((eventRows ?? []) as Array<{
      id: string;
      title: string;
      starts_at: string;
      location: string | null;
    }>).map((event) => ({
      id: event.id,
      title: event.title,
      startsAt: event.starts_at,
      location: event.location ?? "Local não informado",
    })),
  };
}
