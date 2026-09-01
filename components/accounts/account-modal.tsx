"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { createAccount, updateAccount, archiveAccount, type Account, type AccountType } from "@/lib/services/accounts";

type AccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: Account | null;
  userId: string;
};

const accountTypes: { value: AccountType; label: string }[] = [
  { value: "BANK", label: "Conta Banc�ria" },
  { value: "CASH", label: "Dinheiro em M�o" },
  { value: "DIGITAL_WALLET", label: "Carteira Digital" },
  { value: "CARD", label: "Cart�o" },
  { value: "SAVINGS", label: "Conta Poupan�a" },
  { value: "PROJECT", label: "Conta de Projecto" },
  { value: "OTHER", label: "Outro" },
];

function AccountFormInner({
  accountToEdit,
  userId,
  onClose,
}: {
  accountToEdit?: Account | null;
  userId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(accountToEdit?.name ?? "");
  const [type, setType] = useState<AccountType>(accountToEdit?.type ?? "BANK");
  const [initialBalance, setInitialBalance] = useState(accountToEdit ? String(accountToEdit.initial_balance) : "0");
  const [description, setDescription] = useState(accountToEdit?.description ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Indica o nome da carteira.");
      return;
    }

    const initBal = parseFloat(initialBalance.replace(/\s+/g, "").replace(",", "."));
    if (isNaN(initBal)) {
      setError("Saldo inicial inv�lido.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (accountToEdit) {
        await updateAccount(supabase, accountToEdit.id, {
          name: name.trim(),
          type,
          description: description.trim() || null,
        });
      } else {
        await createAccount(supabase, {
          user_id: userId,
          name: name.trim(),
          type,
          initial_balance: initBal,
          description: description.trim() || null,
        });
      }

      router.refresh();
      onClose();
    } catch {
      setError("N�o foi poss�vel guardar a carteira. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive() {
    if (!accountToEdit) return;
    setLoading(true);
    try {
      const supabase = createClient();
      await archiveAccount(supabase, accountToEdit.id);
      router.refresh();
      onClose();
    } catch {
      setError("N�o foi poss�vel arquivar a carteira.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="acc-name">Nome da Carteira</Label>
        <Input
          id="acc-name"
          placeholder="Ex: Conta Familiar, Dinheiro em M�o"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="acc-type">Tipo de Conta</Label>
        <Select
          id="acc-type"
          value={type}
          onChange={(e) => setType(e.target.value as AccountType)}
        >
          {accountTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      {!accountToEdit && (
        <div className="space-y-1.5">
          <Label htmlFor="acc-initial-bal">Saldo Inicial (Kz)</Label>
          <Input
            id="acc-initial-bal"
            type="number"
            step="any"
            placeholder="0,00"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="acc-desc">Descri��o (opcional)</Label>
        <Input
          id="acc-desc"
          placeholder="Ex: Conta principal para despesas do dia-a-dia"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700" role="alert">
          {error}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        {accountToEdit && (
          <Button
            type="button"
            variant="danger"
            disabled={loading}
            onClick={handleArchive}
          >
            Arquivar
          </Button>
        )}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "A guardar..." : accountToEdit ? "Guardar Altera��es" : "Criar Carteira"}
        </Button>
      </div>
    </form>
  );
}

export function AccountModal({
  isOpen,
  onClose,
  accountToEdit,
  userId,
}: AccountModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={accountToEdit ? "Editar Carteira" : "Criar Carteira"}
      description={
        accountToEdit
          ? "Actualiza as informa��es da tua carteira."
          : "Cria uma carteira para acompanhar os teus movimentos."
      }
    >
      <AccountFormInner
        key={accountToEdit?.id ?? "new"}
        accountToEdit={accountToEdit}
        userId={userId}
        onClose={onClose}
      />
    </Modal>
  );
}
