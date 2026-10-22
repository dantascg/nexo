# Supabase

As migrations deste projeto ficam em `supabase/migrations`.

## Aplicar a migration inicial

Abra o SQL Editor do projeto Supabase, cole o conteúdo de
`migrations/20261022120000_initial_schema.sql` e execute uma única vez.

Quando o Supabase CLI estiver configurado, o fluxo equivalente será:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Não coloque chaves secretas em migrations. A migration usa somente `auth.uid()`
e as políticas RLS do próprio Postgres.

## Dados de teste

Depois de criar pelo menos uma conta, execute `seed.sql` no SQL Editor. A seed
cria uma comunidade, três posts e três eventos usando essa conta. Ela pode ser
executada novamente sem duplicar os registros.
