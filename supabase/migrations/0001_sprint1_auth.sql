-- ============================================================
-- Sprint 1 — Autenticação e Perfis
-- Rodar no Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Adiciona coluna role em profiles (se não existir)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'cliente'
  CHECK (role IN ('cliente', 'dev', 'admin'));

-- 2. Função helper para ler o role do usuário autenticado
--    Usada nas políticas RLS e em funções Postgres.
--    STABLE + SECURITY DEFINER = executada 1×/query, sem bypass de RLS.
CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- 3. Cria perfil automaticamente ao registrar novo usuário no Supabase Auth
CREATE OR REPLACE FUNCTION fn_on_auth_user_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cliente')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 4. Trigger no auth.users (idempotente)
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION fn_on_auth_user_created();

-- 5. Habilita RLS em profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Remove políticas antigas para recriar de forma idempotente
DROP POLICY IF EXISTS "profiles: self read"   ON profiles;
DROP POLICY IF EXISTS "profiles: self update" ON profiles;
DROP POLICY IF EXISTS "profiles: admin all"   ON profiles;

-- 7. Políticas RLS
-- Usuário lê apenas o próprio perfil
CREATE POLICY "profiles: self read"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuário atualiza apenas o próprio perfil, sem poder mudar o role
CREATE POLICY "profiles: self update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin tem acesso total
CREATE POLICY "profiles: admin all"
  ON profiles FOR ALL
  USING (auth_role() = 'admin');

-- 8. RLS para projects (se não configurado ainda)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects: client read own" ON projects;
DROP POLICY IF EXISTS "projects: dev read assigned" ON projects;
DROP POLICY IF EXISTS "projects: admin all" ON projects;

CREATE POLICY "projects: client read own"
  ON projects FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "projects: dev read assigned"
  ON projects FOR SELECT
  USING (auth_role() IN ('dev', 'admin'));

CREATE POLICY "projects: admin all"
  ON projects FOR ALL
  USING (auth_role() = 'admin');

-- 9. RLS para token_transactions (ledger imutável)
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tokens: client read own" ON token_transactions;
DROP POLICY IF EXISTS "tokens: admin all" ON token_transactions;

CREATE POLICY "tokens: client read own"
  ON token_transactions FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "tokens: admin all"
  ON token_transactions FOR ALL
  USING (auth_role() = 'admin');
