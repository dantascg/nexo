-- Habilita eventos de novos posts no Supabase Realtime.
-- O bloco é idempotente e pode ser executado mais de uma vez.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'posts'
  ) then
    alter publication supabase_realtime add table public.posts;
  end if;
end;
$$;
