-- ==============================================================================
-- KUMBU: Migração Fase 2 & 3 - Fontes de Rendimento e Regras de Distribuição
-- Não destrutivo: Apenas novas tabelas com RLS habilitado e integridade referencial.
-- ==============================================================================

-- 1. Tabela: income_sources (Fontes de Rendimento cadastradas)
CREATE TABLE IF NOT EXISTS public.income_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'AOA',
    frequency VARCHAR(20) NOT NULL DEFAULT 'MONTHLY', -- 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY', 'OCCASIONAL'
    hours_per_period NUMERIC(6, 2) NOT NULL DEFAULT 0, -- Horas investidas para calcular retorno/hora
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_income_sources_user_id ON public.income_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_income_sources_category_id ON public.income_sources(category_id);

-- RLS para income_sources
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores gerem as suas próprias fontes de rendimento"
    ON public.income_sources
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 2. Tabela: allocation_rules (Regras de Distribuição - "Dividir para Conquistar")
CREATE TABLE IF NOT EXISTS public.allocation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Ex: "Investimento", "Eu / Lazer", "Fundo Protegido", "Família"
    percentage NUMERIC(5, 2) NOT NULL, -- Ex: 20.00 (%)
    color VARCHAR(20) DEFAULT 'kumbu', -- Para visualização no gráfico
    icon VARCHAR(10) DEFAULT '💰',
    target_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    target_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para allocation_rules
CREATE INDEX IF NOT EXISTS idx_allocation_rules_user_id ON public.allocation_rules(user_id);

-- RLS para allocation_rules
ALTER TABLE public.allocation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores gerem as suas próprias regras de alocação"
    ON public.allocation_rules
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Regras padrão para novos utilizadores podem ser criadas se desejado,
-- ou geridas dinamicamente pelo frontend quando o utilizador define o seu plano.
