import { createClient } from "@/lib/supabase/server";

export type Community = {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  visibility: "school" | "private";
  memberCount: number;
  isMember: boolean;
};

export async function getCommunities(): Promise<Community[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: communities, error: communitiesError }, { data: memberships, error: membershipsError }] = await Promise.all([
    supabase.from("communities").select("id, name, slug, description, color, visibility").order("created_at", { ascending: true }),
    supabase.from("community_members").select("community_id, user_id"),
  ]);

  if (communitiesError) console.error("Erro ao carregar comunidades:", communitiesError.message);
  if (membershipsError) console.error("Erro ao carregar membros:", membershipsError.message);

  const counts = new Map<string, number>();
  const memberIds = new Set<string>();
  for (const membership of (memberships ?? []) as Array<{ community_id: string; user_id: string }>) {
    counts.set(membership.community_id, (counts.get(membership.community_id) ?? 0) + 1);
    if (membership.user_id === user.id) memberIds.add(membership.community_id);
  }

  return ((communities ?? []) as Array<{ id: string; name: string; slug: string; description: string; color: string; visibility: Community["visibility"] }>).map((community) => ({
    ...community,
    memberCount: counts.get(community.id) ?? 0,
    isMember: memberIds.has(community.id),
  }));
}
