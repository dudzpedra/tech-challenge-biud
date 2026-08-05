"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
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

  if (transaction.isLoading)
    return (
      <main className="p-6" role="status">
        Carregando transação…
      </main>
    );
  if (transaction.isError)
    return (
      <main className="p-6" role="alert">
        {transaction.error.message}
      </main>
    );
  if (!transaction.data) return null;

  const item = transaction.data;
  return (
    <main className="mx-auto max-w-2xl space-y-5 p-6">
      <Link className="text-brand underline" href="/">
        Voltar para transações
      </Link>
      <h1 className="text-3xl font-bold">Detalhe da transação</h1>
      <dl className="grid grid-cols-2 gap-4 rounded-lg bg-white p-5 shadow-sm">
        <dt>Identificador</dt>
        <dd className="break-all">{item.transactionExternalId}</dd>
        <dt>Tipo</dt>
        <dd>{item.transactionType.name}</dd>
        <dt>Valor</dt>
        <dd>{formatCurrency(item.value)}</dd>
        <dt>Status</dt>
        <dd className="capitalize">{item.transactionStatus.name}</dd>
        <dt>Criada em</dt>
        <dd>{formatDate(item.createdAt)}</dd>
      </dl>
    </main>
  );
}
