"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "../../../components/app-shell";
import { StatusBadge } from "../../../components/status-badge";
import { getTransaction } from "../../../lib/api";
import { formatCurrency, formatDate } from "../../../lib/transactions";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const transaction = useQuery({
    queryKey: ["transaction", id],
    queryFn: () => getTransaction(id),
    refetchInterval: (query) =>
      query.state.data?.transactionStatus.name === "pendente" ? 3000 : false,
  });

  if (transaction.isLoading) {
    return (
      <AppShell title="Detalhe da transação">
        <p className="text-sm text-slate-600" role="status">
          Carregando transação…
        </p>
      </AppShell>
    );
  }

  if (transaction.isError) {
    return (
      <AppShell title="Detalhe da transação">
        <p className="alert-error" role="alert">
          {transaction.error.message}
        </p>
      </AppShell>
    );
  }

  if (!transaction.data) return null;

  const item = transaction.data;

  return (
    <AppShell title="Detalhe da transação">
      <Link className="link-brand inline-flex text-sm" href="/">
        ← Voltar para transações
      </Link>
      <dl className="card detail-grid">
        <dt>Identificador</dt>
        <dd className="break-all font-mono text-xs sm:text-sm">
          {item.transactionExternalId}
        </dd>
        <dt>Tipo</dt>
        <dd>{item.transactionType.name}</dd>
        <dt>Valor</dt>
        <dd className="text-lg font-semibold tabular-nums">
          {formatCurrency(item.value)}
        </dd>
        <dt>Status</dt>
        <dd>
          <StatusBadge status={item.transactionStatus.name} />
        </dd>
        <dt>Criada em</dt>
        <dd>{formatDate(item.createdAt)}</dd>
      </dl>
    </AppShell>
  );
}
