"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils/currency";
import { formatRelativeDate } from "@/lib/utils/date";
import { useQuickAction } from "@/lib/context/quick-action-context";
import { createClient } from "@/lib/supabase/client";
import {
  getIncomeSources,
  frequencyDisplay,
  type IncomeSource,
} from "@/lib/services/income-sources";
import { IncomeSourceModal } from "./income-source-modal";
import type { IncomeByCategory, MonthlySummary } from "@/lib/services/reports";

export type IncomeTransactionItem = {
  id: string;
  amount: number;
  currency: string;
  transaction_date: string;
  description: string | null;
  type: string;
  category?: { name: string; icon: string | null } | null;
  account?: { name: string } | null;
};

type RendimentosViewProps = {
  categoryIncomes: IncomeByCategory[];
  monthSummary: MonthlySummary | null;
  recentIncomes: IncomeTransactionItem[];
  initialIncomeSources?: IncomeSource[];
  categories?: { id: string; name: string; icon?: string | null }[];
  accounts?: { id: string; name: string }[];
};

export function RendimentosView({
  categoryIncomes,
  monthSummary,
  recentIncomes,
  initialIncomeSources = [],
  categories = [],
  accounts = [],
}: RendimentosViewProps) {
  const { openQuickRegister } = useQuickAction();

  // Income sources state
  const [sources, setSources] = useState<IncomeSource[]>(initialIncomeSources);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null);

  const refreshSources = async () => {
    try {
      const supabase = createClient();
      const updated = await getIncomeSources(supabase);
      setSources(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const totalMonthlyIncome = monthSummary?.income ?? 0;
  const totalAllTimeIncome = useMemo(
    () => categoryIncomes.reduce((acc, curr) => acc + (curr.total ?? 0), 0),
    [categoryIncomes]
  );

  const topCategory = categoryIncomes[0];

  // Retorno por Tempo state
  const [fonteAName, setFonteAName] = useState("Salário / Emprego");
  const [fonteAAmount, setFonteAAmount] = useState<string>("250000");
  const [fonteAHours, setFonteAHours] = useState<string>("160");

  const [fonteBName, setFonteBName] = useState("Serviço / Freelance");
  const [fonteBAmount, setFonteBAmount] = useState<string>("80000");
  const [fonteBHours, setFonteBHours] = useState<string>("20");

  // Helper to load a saved source into Fonte A or B
  const applySourceToA = (s: IncomeSource) => {
    setFonteAName(s.name);
    setFonteAAmount(s.amount.toString());
    setFonteAHours((s.hours_per_period || 0).toString());
  };

  const applySourceToB = (s: IncomeSource) => {
    setFonteBName(s.name);
    setFonteBAmount(s.amount.toString());
    setFonteBHours((s.hours_per_period || 0).toString());
  };

  const returnA = useMemo(() => {
    const amt = parseFloat(fonteAAmount) || 0;
    const hrs = parseFloat(fonteAHours) || 0;
    return hrs > 0 ? Math.round(amt / hrs) : 0;
  }, [fonteAAmount, fonteAHours]);

  const returnB = useMemo(() => {
    const amt = parseFloat(fonteBAmount) || 0;
    const hrs = parseFloat(fonteBHours) || 0;
    return hrs > 0 ? Math.round(amt / hrs) : 0;
  }, [fonteBAmount, fonteBHours]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
            Rendimentos
          </h1>
          <p className="mt-0.5 text-sm text-kumbu-500">
            Compreende de onde vem o teu dinheiro, analisa o retorno pelo tempo investido e a distribuição das tuas receitas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setEditingSource(null);
              setIsModalOpen(true);
            }}
            size="sm"
            variant="secondary"
            className="gap-1.5"
          >
            <Icon name="plus" className="w-4 h-4" />
            Nova Fonte
          </Button>
          <Button
            onClick={() => openQuickRegister("INCOME")}
            size="sm"
            className="gap-1.5 self-start bg-emerald-600 hover:bg-emerald-700"
          >
            <Icon name="plus" className="w-4 h-4" />
            Registar Ganho
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-xs space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700">
            Ganhos Este Mês
          </p>
          <p className="text-2xl font-extrabold text-emerald-800 tabular-nums">
            +{formatCurrency(totalMonthlyIncome)}
          </p>
          <p className="text-[11px] text-kumbu-400">
            Total recebido no mês corrente
          </p>
        </div>

        <div className="rounded-3xl border border-kumbu-100 bg-white p-5 shadow-xs space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-kumbu-500">
            Total Acumulado
          </p>
          <p className="text-2xl font-extrabold text-kumbu-900 tabular-nums">
            {formatCurrency(totalAllTimeIncome)}
          </p>
          <p className="text-[11px] text-kumbu-400">
            Histórico de todas as entradas registadas
          </p>
        </div>

        <div className="rounded-3xl border border-kumbu-100 bg-white p-5 shadow-xs space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-kumbu-500">
            Principal Origem
          </p>
          <p className="text-xl font-extrabold text-kumbu-900 truncate">
            {topCategory?.category ?? "Nenhuma ainda"}
          </p>
          <p className="text-[11px] text-kumbu-400">
            {topCategory?.total != null
              ? `${formatCurrency(topCategory.total)} acumulados`
              : "Sem receitas registadas"}
          </p>
        </div>
      </div>

      {/* Fontes Estruturadas de Rendimento Section */}
      <Card className="border-kumbu-100 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">💼</span>
              <h2 className="text-sm font-bold text-kumbu-900">
                Fontes Estruturadas de Rendimento ({sources.length})
              </h2>
            </div>
            <p className="text-xs text-kumbu-500 mt-0.5">
              Actividades e canais de receita configurados para monitorização e cálculo de rentabilidade.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="text-xs gap-1.5"
            onClick={() => {
              setEditingSource(null);
              setIsModalOpen(true);
            }}
          >
            <Icon name="plus" className="w-3.5 h-3.5" />
            Adicionar Fonte
          </Button>
        </div>

        {sources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-kumbu-200 bg-kumbu-50/40 p-6 text-center space-y-2">
            <p className="text-xs font-semibold text-kumbu-800">
              Ainda não configuraste fontes de rendimento estruturadas.
            </p>
            <p className="text-[11px] text-kumbu-500 max-w-md mx-auto">
              Regista os teus empregos, projectos freelance ou negócios para calcular o retorno por hora e comparar rentabilidades com um clique.
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="text-xs"
              onClick={() => {
                setEditingSource(null);
                setIsModalOpen(true);
              }}
            >
              + Configurar primeira fonte
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sources.map((src) => {
              const hourly =
                src.hours_per_period && src.hours_per_period > 0
                  ? Math.round(src.amount / src.hours_per_period)
                  : 0;

              return (
                <div
                  key={src.id}
                  className="rounded-2xl border border-kumbu-100 bg-white p-4 space-y-3 hover:border-emerald-200 transition-colors shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-kumbu-900 truncate">
                        {src.name}
                      </p>
                      <p className="text-[11px] text-kumbu-400 truncate">
                        {src.categories?.name ?? "Rendimento geral"}
                        {src.accounts?.name ? ` · ${src.accounts.name}` : ""}
                      </p>
                    </div>
                    <Badge variant="default" size="sm">
                      {frequencyDisplay[src.frequency] ?? src.frequency}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-kumbu-50">
                    <div>
                      <p className="text-[10px] text-kumbu-400">Montante</p>
                      <p className="text-xs font-bold text-emerald-800 tabular-nums">
                        {formatCurrency(src.amount, src.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-kumbu-400">Horas / Período</p>
                      <p className="text-xs font-semibold text-kumbu-700 tabular-nums">
                        {src.hours_per_period > 0 ? `${src.hours_per_period}h` : "—"}
                      </p>
                    </div>
                  </div>

                  {hourly > 0 && (
                    <div className="rounded-xl bg-emerald-50/70 p-2 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-medium text-emerald-900">
                        ⏱️ Retorno horário:
                      </span>
                      <span className="font-extrabold text-emerald-800 tabular-nums">
                        {formatCurrency(hourly)}/h
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => applySourceToA(src)}
                        className="text-[10px] font-semibold text-kumbu-600 hover:text-kumbu-900 bg-kumbu-50 hover:bg-kumbu-100 rounded-lg px-2 py-1 transition-colors"
                        title="Usar como Fonte A no comparador de horas"
                      >
                        Usar em A
                      </button>
                      <button
                        type="button"
                        onClick={() => applySourceToB(src)}
                        className="text-[10px] font-semibold text-kumbu-600 hover:text-kumbu-900 bg-kumbu-50 hover:bg-kumbu-100 rounded-lg px-2 py-1 transition-colors"
                        title="Usar como Fonte B no comparador de horas"
                      >
                        Usar em B
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSource(src);
                        setIsModalOpen(true);
                      }}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Retorno por Tempo Investido (Prompt Item 12) */}
      <Card className="border-kumbu-100 bg-white p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⏱️</span>
              <h2 className="text-sm font-bold text-kumbu-900">
                Análise Inteligente: Retorno por Tempo Investido
              </h2>
            </div>
            <p className="text-xs text-kumbu-500 mt-0.5">
              Descobre quanto ganhas por cada hora de esforço e compara actividades para optimizar o teu tempo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Fonte A */}
          <div className="rounded-2xl border border-kumbu-100 bg-kumbu-50/40 p-4 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Actividade / Fonte A</Label>
                {sources.length > 0 && (
                  <select
                    onChange={(e) => {
                      const found = sources.find((s) => s.id === e.target.value);
                      if (found) applySourceToA(found);
                    }}
                    className="text-[10px] rounded bg-white border border-kumbu-200 text-kumbu-600 px-1.5 py-0.5"
                    defaultValue=""
                  >
                    <option value="" disabled>Carregar fonte guardada...</option>
                    {sources.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <Input
                value={fonteAName}
                onChange={(e) => setFonteAName(e.target.value)}
                className="h-8 text-xs bg-white"
                placeholder="Ex: Emprego principal"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-kumbu-500">Rendimento (Kz)</Label>
                <Input
                  type="number"
                  value={fonteAAmount}
                  onChange={(e) => setFonteAAmount(e.target.value)}
                  className="h-8 text-xs bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-kumbu-500">Horas investidas</Label>
                <Input
                  type="number"
                  value={fonteAHours}
                  onChange={(e) => setFonteAHours(e.target.value)}
                  className="h-8 text-xs bg-white"
                />
              </div>
            </div>
            <div className="rounded-xl bg-white p-2.5 border border-kumbu-100 flex items-center justify-between">
              <span className="text-[11px] text-kumbu-600">Retorno horário:</span>
              <span className="text-sm font-extrabold text-kumbu-900 tabular-nums">
                {formatCurrency(returnA)} / hora
              </span>
            </div>
          </div>

          {/* Fonte B */}
          <div className="rounded-2xl border border-kumbu-100 bg-kumbu-50/40 p-4 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Actividade / Fonte B</Label>
                {sources.length > 0 && (
                  <select
                    onChange={(e) => {
                      const found = sources.find((s) => s.id === e.target.value);
                      if (found) applySourceToB(found);
                    }}
                    className="text-[10px] rounded bg-white border border-kumbu-200 text-kumbu-600 px-1.5 py-0.5"
                    defaultValue=""
                  >
                    <option value="" disabled>Carregar fonte guardada...</option>
                    {sources.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <Input
                value={fonteBName}
                onChange={(e) => setFonteBName(e.target.value)}
                className="h-8 text-xs bg-white"
                placeholder="Ex: Freelance, Consultoria"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-kumbu-500">Rendimento (Kz)</Label>
                <Input
                  type="number"
                  value={fonteBAmount}
                  onChange={(e) => setFonteBAmount(e.target.value)}
                  className="h-8 text-xs bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-kumbu-500">Horas investidas</Label>
                <Input
                  type="number"
                  value={fonteBHours}
                  onChange={(e) => setFonteBHours(e.target.value)}
                  className="h-8 text-xs bg-white"
                />
              </div>
            </div>
            <div className="rounded-xl bg-white p-2.5 border border-kumbu-100 flex items-center justify-between">
              <span className="text-[11px] text-kumbu-600">Retorno horário:</span>
              <span className="text-sm font-extrabold text-emerald-800 tabular-nums">
                {formatCurrency(returnB)} / hora
              </span>
            </div>
          </div>
        </div>

        {/* Insight comparative banner */}
        {returnA > 0 && returnB > 0 && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 flex items-center gap-3 text-xs text-emerald-950">
            <span className="text-lg">💡</span>
            <div>
              {returnA > returnB ? (
                <span>
                  <strong>{fonteAName}</strong> gera{" "}
                  <strong>{formatCurrency(returnA - returnB)}/h a mais</strong> do que {fonteBName} (
                  {Math.round((returnA / returnB) * 10) / 10}x mais rentável por hora).
                </span>
              ) : returnB > returnA ? (
                <span>
                  <strong>{fonteBName}</strong> gera{" "}
                  <strong>{formatCurrency(returnB - returnA)}/h a mais</strong> do que {fonteAName} (
                  {Math.round((returnB / returnA) * 10) / 10}x mais rentável por hora).
                </span>
              ) : (
                <span>Ambas as fontes geram exactamente o mesmo retorno por hora ({formatCurrency(returnA)}/h).</span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Modal to add / edit income source */}
      <IncomeSourceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSource(null);
        }}
        sourceToEdit={editingSource}
        categories={categories}
        accounts={accounts}
        onSaved={refreshSources}
      />

      {/* Main Content */}
      {recentIncomes.length === 0 && categoryIncomes.length === 0 ? (
        <EmptyState
          icon="💰"
          title="Ainda não tens rendimentos registados."
          description="Regista o teu salário, rendimentos de serviços, vendas ou outros ganhos para começar a acompanhar as tuas entradas."
          actionLabel="+ Registar Ganho"
          onAction={() => openQuickRegister("INCOME")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Category Breakdown */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Origens / Categorias</CardTitle>
                <CardDescription>
                  Distribuição acumulada por tipo de receita
                </CardDescription>
              </CardHeader>

              <div className="space-y-4 pt-2">
                {categoryIncomes.map((cat, idx) => {
                  const total = cat.total ?? 0;
                  const pct =
                    totalAllTimeIncome > 0
                      ? Math.round((total / totalAllTimeIncome) * 100)
                      : 0;

                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-kumbu-900">
                          {cat.category ?? "Sem Categoria"}
                        </span>
                        <span className="font-medium text-emerald-700 tabular-nums">
                          {formatCurrency(total)} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-kumbu-100">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Income Allocation Tip */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                <span>🎯</span>
                <span>Dividir para Conquistar</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Ao receber um novo rendimento, distribui parcelas para despesas essenciais, fundo protegido, lazer e projectos de longo prazo. Podes pré-visualizar a divisão directa no botão "+ Registar Ganho".
              </p>
            </div>
          </div>

          {/* Recent Incomes List */}
          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-sm font-semibold text-kumbu-800">
              Últimas Entradas Registadas
            </h2>

            <div className="overflow-hidden rounded-2xl border border-kumbu-100 bg-white divide-y divide-kumbu-50">
              {recentIncomes.map((inc) => (
                <div
                  key={inc.id}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-kumbu-50/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                      {inc.category?.icon ? inc.category.icon : "💰"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-kumbu-900 truncate">
                        {inc.category?.name ?? "Rendimento"}
                      </p>
                      <p className="text-[11px] text-kumbu-400 truncate">
                        {inc.account?.name ?? "Carteira"}
                        {inc.description ? ` · ${inc.description}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs font-bold text-emerald-700 tabular-nums">
                      +{formatCurrency(inc.amount, inc.currency)}
                    </p>
                    <p className="text-[10px] text-kumbu-400">
                      {formatRelativeDate(inc.transaction_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
