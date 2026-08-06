"use client";

import Link from "next/link";
import { StatusBadge } from "../components/status-badge";
import {
  formatCurrency,
  formatDate,
  Transaction,
  TransactionFilters,
  TransactionStatus,
} from "../lib/transactions";
import { useTransactionsQuery } from "../app/hooks/use-transactions";

const statuses: TransactionStatus[] = ["pendente", "aprovada", "rejeitada"];

interface TransactionHistoryProps {
  filters: TransactionFilters;
  onFilterChange: (newFilters: TransactionFilters) => void;
}

export function TransactionHistory({
  filters,
  onFilterChange,
}: TransactionHistoryProps) {
  const { data, isLoading, isError, error } = useTransactionsQuery(filters);

  const totalPages = Math.max(
    1,
    Math.ceil((data?.total ?? 0) / (filters.limit ?? 10)),
  );

  return (
    <section className="card space-y-5">
      <h2 className="card-title">Histórico</h2>

      {/* Barramento de Filtros */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="field-label">Status</span>
          <select
            value={filters.status ?? ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                status: (e.target.value as TransactionStatus) || undefined,
                page: 1,
              })
            }
          >
            <option value="">Todos</option>
            {statuses.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="field-label">Tipo</span>
          <select
            value={filters.type ?? ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                type: e.target.value || undefined,
                page: 1,
              })
            }
          >
            <option value="">Todos</option>
            <option value="PIX">PIX</option>
            <option value="TED">TED</option>
          </select>
        </label>

        <label className="block">
          <span className="field-label">Data inicial</span>
          <input
            type="date"
            value={filters.from ?? ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                from: e.target.value || undefined,
                page: 1,
              })
            }
          />
        </label>

        <label className="block">
          <span className="field-label">Data final</span>
          <input
            type="date"
            value={filters.to ?? ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                to: e.target.value || undefined,
                page: 1,
              })
            }
          />
        </label>
      </div>

      {/* Estados da Tabela */}
      {isLoading && (
        <p className="text-sm text-slate-600">Carregando transações…</p>
      )}
      {isError && (
        <p className="alert-error" role="alert">
          {error.message}
        </p>
      )}
      {data?.items.length === 0 && (
        <p className="empty-state">
          Nenhuma transação encontrada para os filtros informados.
        </p>
      )}

      {/* Tabela de Dados */}
      {data && data.items.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item: Transaction) => (
                <tr key={item.transactionExternalId}>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>{item.transactionType.name}</td>
                  <td className="font-medium tabular-nums">
                    {formatCurrency(item.value)}
                  </td>
                  <td>
                    <StatusBadge status={item.transactionStatus.name} />
                  </td>
                  <td>
                    <Link
                      className="link-brand"
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

      {/* Paginação */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="text-sm text-slate-600">
          Página {filters.page} de {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            className="btn-secondary"
            disabled={(filters.page ?? 1) === 1}
            onClick={() =>
              onFilterChange({ ...filters, page: (filters.page ?? 1) - 1 })
            }
            type="button"
          >
            Anterior
          </button>
          <button
            className="btn-secondary"
            disabled={(filters.page ?? 1) >= totalPages}
            onClick={() =>
              onFilterChange({ ...filters, page: (filters.page ?? 1) + 1 })
            }
            type="button"
          >
            Próxima
          </button>
        </div>
      </div>
    </section>
  );
}
