drop policy if exists "users can create their own posts" on public.posts;

create policy "members can create community posts"
on public.posts for insert to authenticated
with check (
  (select auth.uid()) = author_id
  and (community_id is null or exists (select 1 from public.community_members cm where cm.community_id = posts.community_id and cm.user_id = (select auth.uid())))
);
