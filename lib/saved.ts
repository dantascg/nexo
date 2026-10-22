import { createClient } from "@/lib/supabase/server";

export type SavedItem = { postId: string; authorName: string; authorInitials: string; authorColor: string; createdAt: string; body: string; collection: string; communityName: string };

function initials(name: string) { const parts = name.split(/\s+/).filter(Boolean); return ((parts[0]?.[0] ?? "?") + (parts.at(-1)?.[0] ?? "")).toUpperCase(); }

export async function getSavedItems(): Promise<SavedItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: saved, error } = await supabase.from("saved_items").select("post_id, collection, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) { console.error("Erro ao carregar salvos:", error.message); return []; }
  const rows = (saved ?? []) as Array<{ post_id: string; collection: string; created_at: string }>;
  const postIds = rows.map((row) => row.post_id);
  if (!postIds.length) return [];
  const { data: posts } = await supabase.from("posts").select("id, body, created_at, author_id, community_id").in("id", postIds);
  const postRows = (posts ?? []) as Array<{ id: string; body: string; created_at: string; author_id: string; community_id: string | null }>;
  const authorIds = [...new Set(postRows.map((post) => post.author_id))];
  const communityIds = [...new Set(postRows.map((post) => post.community_id).filter((id): id is string => Boolean(id)))];
  const [{ data: profiles }, { data: communities }] = await Promise.all([
    authorIds.length ? supabase.from("profiles").select("id, full_name").in("id", authorIds) : Promise.resolve({ data: [] }),
    communityIds.length ? supabase.from("communities").select("id, name, color").in("id", communityIds) : Promise.resolve({ data: [] }),
  ]);
  const names = new Map(((profiles ?? []) as Array<{ id: string; full_name: string }>).map((profile) => [profile.id, profile.full_name || "Usuário"]));
  const communitiesById = new Map(((communities ?? []) as Array<{ id: string; name: string; color: string }>).map((community) => [community.id, community]));
  const postMap = new Map(postRows.map((post) => [post.id, post]));
  return rows.flatMap((row) => { const post = postMap.get(row.post_id); if (!post) return []; const authorName = names.get(post.author_id) ?? "Usuário"; const community = post.community_id ? communitiesById.get(post.community_id) : undefined; return [{ postId: post.id, authorName, authorInitials: initials(authorName), authorColor: community?.color ?? "#4e82b8", createdAt: post.created_at, body: post.body, collection: row.collection, communityName: community?.name ?? "Geral" }]; });
}
