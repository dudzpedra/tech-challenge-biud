"use client";

import { useState } from "react";
import { AppShell } from "../components/app-shell";
import { TransactionForm } from "../components/transaction-form";
import { TransactionHistory } from "../components/transaction-history";
import { TransactionFilters } from "../lib/transactions";

export default function DashboardPage() {
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 10,
  });

  return (
    <AppShell
      title="Transações"
      description="Crie transferências, acompanhe o status pendente e veja a decisão antifraude em tempo real."
    >
      <TransactionForm />
      <TransactionHistory filters={filters} onFilterChange={setFilters} />
    </AppShell>
  );
}
