"use client";

import React, { createContext, useContext, useState } from "react";
import { QuickRegisterModal } from "@/components/transactions/quick-register-modal";

type ActionType = "INCOME" | "EXPENSE" | "TRANSFER" | "GOAL" | "NEW_DEBT" | "PAY_DEBT" | "PROJECT";

type QuickActionContextType = {
  openQuickRegister: (action?: ActionType) => void;
  closeQuickRegister: () => void;
};

const QuickActionContext = createContext<QuickActionContextType | undefined>(undefined);

export function QuickActionProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultAction, setDefaultAction] = useState<ActionType>("EXPENSE");

  function openQuickRegister(action: ActionType = "EXPENSE") {
    setDefaultAction(action);
    setIsOpen(true);
  }

  function closeQuickRegister() {
    setIsOpen(false);
  }

  return (
    <QuickActionContext.Provider value={{ openQuickRegister, closeQuickRegister }}>
      {children}
      <QuickRegisterModal
        isOpen={isOpen}
        onClose={closeQuickRegister}
        defaultAction={defaultAction}
      />
    </QuickActionContext.Provider>
  );
}

export function useQuickAction() {
  const context = useContext(QuickActionContext);
  if (!context) {
    throw new Error("useQuickAction must be used within a QuickActionProvider");
  }
  return context;
}
