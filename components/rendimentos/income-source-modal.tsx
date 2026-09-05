"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import {
  createIncomeSource,
  updateIncomeSource,
  deleteIncomeSource,
  frequencyDisplay,
  type IncomeSource,
  type IncomeSourceFrequency,
} from "@/lib/services/income-sources";

type SimpleOption = {
  id: string;
  name: string;
  icon?: string | null;
};

type IncomeSourceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sourceToEdit?: IncomeSource | null;
  categories: SimpleOption[];
  accounts: SimpleOption[];
  onSaved: () => void;
};

export function IncomeSourceModal({
  isOpen,
  onClose,
  sourceToEdit,
  categories,
  accounts,
  onSaved,
}: IncomeSourceModalProps) {
  const isEditing = !!sourceToEdit;

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<IncomeSourceFrequency>("MONTHLY");
  const [hours, setHours] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sourceToEdit) {
      setName(sourceToEdit.name);
      setAmount(sourceToEdit.amount.toString());
      setFrequency(sourceToEdit.frequency);
      setHours(sourceToEdit.hours_per_period ? sourceToEdit.hours_per_period.toString() : "");
      setCategoryId(sourceToEdit.category_id ?? "");
      setAccountId(sourceToEdit.account_id ?? "");
      setNotes(sourceToEdit.notes ?? "");
    } else {
      setName("");
      setAmount("");
      setFrequency("MONTHLY");
      setHours("160");
      setCategoryId("");
      setAccountId("");
      setNotes("");
    }
    setError(null);
  }, [sourceToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Indica o nome da fonte de rendimento.");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Indica um montante válido maior que zero.");
      return;
    }

    const numHours = parseFloat(hours) || 0;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão não iniciada");

      if (isEditing && sourceToEdit) {
        await updateIncomeSource(supabase, sourceToEdit.id, {
          name: name.trim(),
          amount: numAmount,
          frequency,
          hours_per_period: numHours,
          category_id: categoryId || null,
          account_id: accountId || null,
          notes: notes.trim() || null,
        });
      } else {
        await createIncomeSource(supabase, {
          user_id: user.id,
          name: name.trim(),
          amount: numAmount,
          frequency,
          hours_per_period: numHours,
          category_id: categoryId || null,
          account_id: accountId || null,
          notes: notes.trim() || null,
        });
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao guardar a fonte de rendimento.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!sourceToEdit) return;
    if (!confirm(`Tens a certeza que desejas remover a fonte "${sourceToEdit.name}"?`)) return;

    setLoading(true);
    try {
      const supabase = createClient();
      await deleteIncomeSource(supabase, sourceToEdit.id);
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao remover a fonte de rendimento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Fonte de Rendimento" : "Nova Fonte de Rendimento"}
      description="Regista ou ajusta uma actividade geradora de receita para calcular o retorno real pelo teu tempo."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="source-name">Nome da Actividade / Fonte *</Label>
          <Input
            id="source-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Salário Principal, Consultoria, Projectos Web"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="source-amount">Rendimento (Kz) *</Label>
            <Input
              id="source-amount"
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 350000"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="source-frequency">Periodicidade</Label>
            <Select
              id="source-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as IncomeSourceFrequency)}
            >
              {Object.entries(frequencyDisplay).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="source-hours">Horas Dedicadas por Período</Label>
            <Input
              id="source-hours"
              type="number"
              min="0"
              step="any"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Ex: 160 (mês) ou 40 (semana)"
            />
            <p className="text-[10px] text-kumbu-400">
              Usado para calcular a rentabilidade (Kz/hora).
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="source-account">Carteira Padrão (Opcional)</Label>
            <Select
              id="source-account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              <option value="">Nenhuma seleccionada</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="source-category">Categoria de Receita (Opcional)</Label>
          <Select
            id="source-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Nenhuma seleccionada</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon ? `${cat.icon} ` : ""}{cat.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="source-notes">Notas / Observações</Label>
          <Input
            id="source-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Contrato de 12 meses, dedução de impostos, etc."
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-kumbu-100">
          {isEditing ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
            >
              Eliminar
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? "A guardar..." : isEditing ? "Actualizar" : "Criar Fonte"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
