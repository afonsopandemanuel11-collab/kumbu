# KUMBU — Gestão Financeira Pessoal

Frontend Next.js ligado ao Supabase real (`swjgcecrdzmmlpkdthsq`).

## Configuração

1. Instalar dependências:

```bash
npm install
```

2. Criar `.env.local` na raiz do projecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://swjgcecrdzmmlpkdthsq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<a_tua_publishable_key>
```

Obtém a publishable key no dashboard Supabase do projecto **kumbu** (Settings → API).

3. Iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth + Database

## Fases

- **Fase 1 (actual):** Auth, layout, navegação, design system, perfil
- **Fase 2:** Dashboard, carteiras, transacções, diário
- **Fase 3+:** Projectos, dívidas, metas, orçamentos, relatórios
