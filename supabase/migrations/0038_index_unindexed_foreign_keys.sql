-- Performance: adiciona índices de cobertura para foreign keys que não tinham
-- (advisor "unindexed_foreign_keys"). Várias dessas colunas são filtradas em
-- praticamente todo carregamento de página do portal (client_id) ou usadas em
-- joins (project_id), então o ganho é direto nas contagens e listas.
--
-- Tabelas pequenas no estágio atual → CREATE INDEX simples é rápido e seguro.

CREATE INDEX IF NOT EXISTS idx_contracts_client_id        ON public.contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_project_id        ON public.contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_client_id         ON public.feedbacks(client_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_author_id ON public.knowledge_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_author_id   ON public.project_updates(author_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_project_id  ON public.project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id          ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_votes_user_id       ON public.roadmap_votes(user_id);
