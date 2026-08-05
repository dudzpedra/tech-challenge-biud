"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { createTransaction, listTransactions } from "../lib/api";
import {
  formatCurrency,
  formatDate,
  TransactionFilters,
  TransactionStatus,
} from "../lib/transactions";

const statuses: TransactionStatus[] = ["pendente", "aprovada", "rejeitada"];

export default function DashboardPage() {
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 10,
  });
  const queryClient = useQueryClient();
  const transactions = useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => listTransactions(filters),
    refetchInterval: (query) =>
      query.state.data?.items.some(
        (item) => item.transactionStatus.name === "pendente",
      )
        ? 3000
        : false,
  });
  const create = useMutation({
    mutationFn: createTransaction,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    create.mutate({
      accountExternalIdDebit: String(data.get("accountExternalIdDebit")),
      accountExternalIdCredit: String(data.get("accountExternalIdCredit")),
      transferTypeId: Number(data.get("transferTypeId")),
      value: Number(data.get("value")),
    });
  }

  const totalPages = Math.max(
    1,
    Math.ceil((transactions.data?.total ?? 0) / (filters.limit ?? 10)),
  );

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <header>
        <h1 className="text-3xl font-bold">Transações</h1>
        <p className="text-slate-600">
          Acompanhamento assíncrono de transferências.
        </p>
      </header>
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Nova transação</h2>
        <form className="grid gap-3 md:grid-cols-4" onSubmit={submit}>
          <input
            required
            name="accountExternalIdDebit"
            aria-label="Conta de débito"
            placeholder="UUID da conta de débito"
          />
          <input
            required
            name="accountExternalIdCredit"
            aria-label="Conta de crédito"
            placeholder="UUID da conta de crédito"
          />
          <select name="transferTypeId" aria-label="Tipo de transferência">
            <option value="1">PIX</option>
            <option value="2">TED</option>
          </select>
          <input
            required
            name="value"
            aria-label="Valor"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Valor"
          />
          <button
            className="md:col-span-4 md:justify-self-start"
            disabled={create.isPending}
            type="submit"
          >
            {create.isPending ? "Criando…" : "Criar transação"}
          </button>
          {create.isError && (
            <p className="text-sm text-red-700" role="alert">
              {create.error.message}
            </p>
          )}
        </form>
      </section>
      <section className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <select
            aria-label="Filtrar por status"
            value={filters.status ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                status: (event.target.value as TransactionStatus) || undefined,
                page: 1,
              })
            }
          >
            <option value="">Todos os status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por tipo"
            value={filters.type ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                type: event.target.value || undefined,
                page: 1,
              })
            }
          >
            <option value="">Todos os tipos</option>
            <option value="PIX">PIX</option>
            <option value="TED">TED</option>
          </select>
          <input
            aria-label="Data inicial"
            type="date"
            value={filters.from ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                from: event.target.value || undefined,
                page: 1,
              })
            }
          />
          <input
            aria-label="Data final"
            type="date"
            value={filters.to ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                to: event.target.value || undefined,
                page: 1,
              })
            }
          />
        </div>
        {transactions.isLoading && <p role="status">Carregando transações…</p>}
        {transactions.isError && (
          <p className="text-red-700" role="alert">
            {transactions.error.message}
          </p>
        )}
        {transactions.data?.items.length === 0 && (
          <p>Nenhuma transação encontrada para os filtros informados.</p>
        )}
        {transactions.data && transactions.data.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Data</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Valor</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Ação</th>
                </tr>
              </thead>
              <tbody>
                {transactions.data.items.map((item) => (
                  <tr className="border-b" key={item.transactionExternalId}>
                    <td className="p-2">{formatDate(item.createdAt)}</td>
                    <td className="p-2">{item.transactionType.name}</td>
                    <td className="p-2">{formatCurrency(item.value)}</td>
                    <td className="p-2 capitalize">
                      {item.transactionStatus.name}
                    </td>
                    <td className="p-2">
                      <Link
                        className="text-brand underline"
                        href={`/transactions/${item.transactionExternalId}`}
                      >
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            disabled={(filters.page ?? 1) === 1}
            onClick={() =>
              setFilters({ ...filters, page: (filters.page ?? 1) - 1 })
            }
          >
            Anterior
          </button>
          <span>
            Página {filters.page} de {totalPages}
          </span>
          <button
            disabled={(filters.page ?? 1) >= totalPages}
            onClick={() =>
              setFilters({ ...filters, page: (filters.page ?? 1) + 1 })
            }
          >
            Próxima
          </button>
        </div>
      </section>
    </main>
  );
}
