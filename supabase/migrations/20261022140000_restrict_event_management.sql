-- Apenas equipe escolar pode gerenciar eventos.
-- Alunos continuam podendo consultar os eventos publicados.

drop policy if exists "users can create events as themselves" on public.events;
drop policy if exists "creators can update their events" on public.events;
drop policy if exists "creators can delete their events" on public.events;

create policy "school staff can create events"
on public.events for insert to authenticated
with check (
  (select auth.uid()) = created_by
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('teacher', 'staff', 'admin')
  )
  and public.can_access_community(community_id)
);

create policy "school staff can update events"
on public.events for update to authenticated
using (
  (select auth.uid()) = created_by
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('teacher', 'staff', 'admin')
  )
)
with check (
  (select auth.uid()) = created_by
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('teacher', 'staff', 'admin')
  )
  and public.can_access_community(community_id)
);

create policy "school staff can delete events"
on public.events for delete to authenticated
using (
  (select auth.uid()) = created_by
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('teacher', 'staff', 'admin')
  )
);
