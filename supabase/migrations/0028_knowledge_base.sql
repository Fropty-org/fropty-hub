create table public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text,
  category text not null default 'geral'
    check (category in ('geral','suporte','produto','financeiro','projetos','seguranca','integracao')),
  product text,
  tags text[] default '{}',
  published boolean not null default false,
  views int not null default 0,
  helpful_yes int not null default 0,
  helpful_no int not null default 0,
  author_id uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS: clientes podem ler apenas artigos publicados
alter table public.knowledge_articles enable row level security;

create policy "anyone_reads_published" on public.knowledge_articles
  for select using (published = true);

create policy "admins_all_articles" on public.knowledge_articles
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Incrementar views sem RLS para anon
create or replace function public.increment_article_views(article_id uuid)
returns void language sql security definer as $$
  update public.knowledge_articles set views = views + 1 where id = article_id;
$$;

-- Feedback de utilidade
create or replace function public.rate_article(article_id uuid, helpful boolean)
returns void language sql security definer as $$
  update public.knowledge_articles
  set helpful_yes = helpful_yes + case when helpful then 1 else 0 end,
      helpful_no  = helpful_no  + case when helpful then 0 else 1 end
  where id = article_id;
$$;

create trigger knowledge_articles_updated_at before update on public.knowledge_articles
  for each row execute function public.set_updated_at();

-- Seed com artigos iniciais
insert into public.knowledge_articles (title, slug, content, excerpt, category, published) values
  (
    'Como abrir um chamado',
    'como-abrir-chamado',
    '## Como abrir um chamado no Fropty Hub

Para abrir um chamado, acesse **Suporte** no menu lateral e clique em **Novo Chamado**.

### Campos obrigatórios
- **Título**: descreva o problema de forma objetiva
- **Produto**: selecione qual produto ou serviço Fropty está relacionado
- **Tipo**: Bug, Dúvida, Suporte Técnico, etc.
- **Prioridade**: avalie o impacto no seu negócio

### Dicas
- Inclua capturas de tela quando possível
- Descreva os passos para reproduzir o problema
- Mencione quando o problema começou

Após enviar, você receberá um e-mail de confirmação e nossa equipe responderá conforme o SLA do seu plano.',
    'Aprenda como abrir um chamado de suporte no Fropty Hub em poucos passos.',
    'suporte',
    true
  ),
  (
    'Entendendo os tokens de suporte',
    'tokens-de-suporte',
    '## Tokens de suporte

Cada chamado aberto consome **1 token** do seu saldo. Os tokens são a moeda de suporte do Fropty Hub.

### Como adquirir tokens
- **Plano Básico**: 4 tokens/mês inclusos
- **Plano Pro**: 8 tokens/mês inclusos
- **Avulso**: compre tokens extras a qualquer momento na área Financeiro

### Gestão do saldo
Seu saldo atual aparece no dashboard e na área Financeiro. Você receberá um alerta por e-mail quando o saldo estiver baixo.

### Chamados não consomem token
Chamados de natureza financeira ou comercial podem ser abertos sem consumir tokens — entre em contato pelo WhatsApp para esses casos.',
    'Entenda como funciona o sistema de tokens de suporte do Fropty Hub.',
    'financeiro',
    true
  ),
  (
    'SLA — Prazos de atendimento',
    'sla-prazos-atendimento',
    '## SLA — Prazos de atendimento

O SLA (Service Level Agreement) define os prazos máximos para resposta e resolução dos chamados.

| Prioridade | Primeira resposta | Resolução |
|---|---|---|
| Alta       | 4 horas           | 24 horas  |
| Média      | 8 horas           | 48 horas  |
| Baixa      | 24 horas          | 72 horas  |

### Horário de atendimento
O SLA é contado em dias úteis, das 9h às 18h (horário de Brasília).

### Escalação automática
Chamados próximos do vencimento são escalados automaticamente para nossa equipe de especialistas.',
    'Conheça os prazos de atendimento (SLA) para cada prioridade de chamado.',
    'suporte',
    true
  );
