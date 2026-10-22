-- Nexo Escolar - schema inicial
-- A autenticação continua sob responsabilidade do Supabase Auth.
-- Estas tabelas armazenam apenas os dados de produto e usam auth.uid() nas políticas.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'student'
    check (role in ('student', 'teacher', 'staff', 'guardian', 'admin')),
  avatar_url text,
  bio text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete restrict,
  name text not null check (char_length(trim(name)) between 2 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null default '' check (char_length(description) <= 2000),
  color text not null default '#4e82b8'
    check (color ~ '^#[0-9a-fA-F]{6}$'),
  visibility text not null default 'school'
    check (visibility in ('school', 'private')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.community_members (
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'moderator', 'member')),
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (community_id, user_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  community_id uuid references public.communities (id) on delete set null,
  body text not null check (char_length(trim(body)) between 1 and 5000),
  attachment_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (post_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.saved_items (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  collection text not null default 'Geral'
    check (char_length(trim(collection)) between 1 and 80),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, post_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  community_id uuid references public.communities (id) on delete set null,
  title text not null check (char_length(trim(title)) between 2 and 160),
  description text not null default '' check (char_length(description) <= 3000),
  category text not null default 'other'
    check (category in ('assessment', 'club', 'project', 'meeting', 'other')),
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (ends_at is null or ends_at > starts_at)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  type text not null
    check (type in ('like', 'comment', 'community_invite', 'event', 'announcement')),
  post_id uuid references public.posts (id) on delete cascade,
  event_id uuid references public.events (id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index communities_owner_id_idx on public.communities (owner_id);
create index community_members_user_id_idx on public.community_members (user_id);
create index posts_created_at_idx on public.posts (created_at desc);
create index posts_community_created_at_idx on public.posts (community_id, created_at desc);
create index comments_post_created_at_idx on public.comments (post_id, created_at asc);
create index events_starts_at_idx on public.events (starts_at);
create index events_community_starts_at_idx on public.events (community_id, starts_at);
create index notifications_recipient_created_at_idx
  on public.notifications (recipient_id, created_at desc);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger communities_set_updated_at
before update on public.communities
for each row execute function public.set_updated_at();

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

create trigger comments_set_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

-- Cria o perfil de produto no primeiro cadastro do Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Também cobre contas criadas antes desta migration.
insert into public.profiles (id, full_name)
select
  id,
  coalesce(nullif(trim(raw_user_meta_data ->> 'name'), ''), '')
from auth.users
on conflict (id) do nothing;

create or replace function public.handle_new_community()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.community_members (community_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (community_id, user_id) do update set role = 'owner';
  return new;
end;
$$;

create trigger on_community_created
after insert on public.communities
for each row execute function public.handle_new_community();

create or replace function public.can_access_community(target_community_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select
    target_community_id is null
    or exists (
      select 1
      from public.communities c
      left join public.community_members cm
        on cm.community_id = c.id
       and cm.user_id = (select auth.uid())
      where c.id = target_community_id
        and (
          c.visibility = 'school'
          or c.owner_id = (select auth.uid())
          or cm.user_id is not null
        )
    );
$$;

alter table public.profiles enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.saved_items enable row level security;
alter table public.events enable row level security;
alter table public.notifications enable row level security;

create policy "authenticated users can read profiles"
on public.profiles for select to authenticated
using (true);

create policy "users can update their own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "users can read visible communities"
on public.communities for select to authenticated
using (
  public.can_access_community(id)
);

create policy "users can create communities"
on public.communities for insert to authenticated
with check ((select auth.uid()) = owner_id);

create policy "owners can update communities"
on public.communities for update to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "owners can delete communities"
on public.communities for delete to authenticated
using ((select auth.uid()) = owner_id);

create policy "authenticated users can read memberships"
on public.community_members for select to authenticated
using (
  user_id = (select auth.uid())
  or public.can_access_community(community_id)
);

create policy "users can join communities"
on public.community_members for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.communities c
    where c.id = community_id
      and c.visibility = 'school'
  )
);

create policy "users can leave communities"
on public.community_members for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "users can read posts in visible communities"
on public.posts for select to authenticated
using (
  public.can_access_community(community_id)
);

create policy "users can create their own posts"
on public.posts for insert to authenticated
with check (
  (select auth.uid()) = author_id
  and public.can_access_community(community_id)
);

create policy "authors can update their own posts"
on public.posts for update to authenticated
using ((select auth.uid()) = author_id)
with check (
  (select auth.uid()) = author_id
  and public.can_access_community(community_id)
);

create policy "authors can delete their own posts"
on public.posts for delete to authenticated
using ((select auth.uid()) = author_id);

create policy "authenticated users can read likes"
on public.post_likes for select to authenticated
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_id
      and public.can_access_community(p.community_id)
  )
);

create policy "users can like posts as themselves"
on public.post_likes for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.posts p
    where p.id = post_id
      and public.can_access_community(p.community_id)
  )
);

create policy "users can remove their own likes"
on public.post_likes for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "authenticated users can read comments"
on public.comments for select to authenticated
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_id
      and public.can_access_community(p.community_id)
  )
);

create policy "users can create their own comments"
on public.comments for insert to authenticated
with check (
  (select auth.uid()) = author_id
  and exists (
    select 1
    from public.posts p
    where p.id = post_id
      and public.can_access_community(p.community_id)
  )
);

create policy "authors can update their own comments"
on public.comments for update to authenticated
using ((select auth.uid()) = author_id)
with check (
  (select auth.uid()) = author_id
  and exists (
    select 1
    from public.posts p
    where p.id = post_id
      and public.can_access_community(p.community_id)
  )
);

create policy "authors can delete their own comments"
on public.comments for delete to authenticated
using ((select auth.uid()) = author_id);

create policy "users can read their saved items"
on public.saved_items for select to authenticated
using ((select auth.uid()) = user_id);

create policy "users can save items as themselves"
on public.saved_items for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "users can update their saved items"
on public.saved_items for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "users can delete their saved items"
on public.saved_items for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "authenticated users can read events"
on public.events for select to authenticated
using (public.can_access_community(community_id));

create policy "users can create events as themselves"
on public.events for insert to authenticated
with check (
  (select auth.uid()) = created_by
  and public.can_access_community(community_id)
);

create policy "creators can update their events"
on public.events for update to authenticated
using ((select auth.uid()) = created_by)
with check (
  (select auth.uid()) = created_by
  and public.can_access_community(community_id)
);

create policy "creators can delete their events"
on public.events for delete to authenticated
using ((select auth.uid()) = created_by);

create policy "users can read their notifications"
on public.notifications for select to authenticated
using ((select auth.uid()) = recipient_id);

create policy "users can mark their notifications"
on public.notifications for update to authenticated
using ((select auth.uid()) = recipient_id)
with check ((select auth.uid()) = recipient_id);
