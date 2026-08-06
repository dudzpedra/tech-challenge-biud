import { TransactionStatus } from "../lib/transactions";

const styles: Record<TransactionStatus, string> = {
  pendente: "bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-200/80",
  aprovada:
    "bg-emerald-50 text-emerald-900 ring-1 ring-inset ring-emerald-200/80",
  rejeitada: "bg-rose-50 text-rose-900 ring-1 ring-inset ring-rose-200/80",
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}
