-- Nexo Escolar - dados de demonstração para desenvolvimento
-- Execute depois da migration inicial.
-- A seed usa o primeiro usuário existente no Auth como autor dos registros.

begin;

do $$
declare
  seed_user uuid;
  seed_community uuid;
begin
  select id
  into seed_user
  from auth.users
  order by created_at asc
  limit 1;

  if seed_user is null then
    raise notice 'Nenhum usuário encontrado em auth.users. Crie uma conta antes de executar a seed.';
    return;
  end if;

  insert into public.profiles (id, full_name, role)
  select
    seed_user,
    coalesce(nullif(trim(raw_user_meta_data ->> 'name'), ''), 'Usuário de teste'),
    'student'
  from auth.users
  where id = seed_user
  on conflict (id) do nothing;

  insert into public.communities (owner_id, name, slug, description, color, visibility)
  values (
    seed_user,
    'Clube de Debates',
    'clube-de-debates',
    'Argumentação, atualidades e encontros semanais para trocar perspectivas.',
    '#ef6f58',
    'school'
  )
  on conflict (slug) do update
    set name = excluded.name,
        description = excluded.description,
        color = excluded.color,
        visibility = excluded.visibility
  returning id into seed_community;

  if seed_community is null then
    select id
    into seed_community
    from public.communities
    where slug = 'clube-de-debates';
  end if;

  insert into public.community_members (community_id, user_id, role)
  values (seed_community, seed_user, 'owner')
  on conflict (community_id, user_id) do update set role = 'owner';

  insert into public.posts (author_id, community_id, body)
  select seed_user, seed_community, texto
  from (values
    ('Seed de teste: este é o primeiro post real carregado do Supabase.'),
    ('A comunidade já está pronta para receber conversas, projetos e avisos.'),
    ('Próximo passo: trocar as outras telas mockadas por consultas reais.')
  ) as dados(texto)
  where not exists (
    select 1
    from public.posts p
    where p.author_id = seed_user
      and p.community_id = seed_community
      and p.body = dados.texto
  );

  insert into public.events (created_by, community_id, title, description, category, location, starts_at, ends_at)
  select seed_user, seed_community, titulo, descricao, categoria, local_evento,
    now() + deslocamento,
    now() + deslocamento + duracao
  from (values
    ('Debate aberto', 'Roda de conversa para testar o feed e a comunidade.', 'club', 'Biblioteca', interval '1 day', interval '1 hour'),
    ('Feira de Ciências', 'Apresentação dos projetos do bimestre.', 'project', 'Laboratório de Ciências', interval '3 days', interval '2 hours'),
    ('Reunião do Clube de Debates', 'Encontro semanal dos participantes.', 'meeting', 'Sala multiuso', interval '7 days', interval '1 hour')
  ) as dados(titulo, descricao, categoria, local_evento, deslocamento, duracao)
  where not exists (
    select 1
    from public.events e
    where e.created_by = seed_user
      and e.community_id = seed_community
      and e.title = dados.titulo
  );

  raise notice 'Seed criada para o usuário %.', seed_user;
end;
$$;

commit;
