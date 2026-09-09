-- ==============================================================================
-- KUMBU 2.0: Idempotência para Sincronização Offline-First
-- Adiciona client_operation_id para evitar duplicação em caso de retry
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'transactions'
          AND column_name = 'client_operation_id'
    ) THEN
        ALTER TABLE public.transactions
        ADD COLUMN client_operation_id UUID;
    END IF;
END $$;

-- Índice único parcial para garantir que cada operação cliente seja inserida apenas uma vez
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_client_operation_id
ON public.transactions(client_operation_id)
WHERE client_operation_id IS NOT NULL;

COMMENT ON COLUMN public.transactions.client_operation_id IS 'UUID gerado no cliente para garantir idempotência em operações offline.';
