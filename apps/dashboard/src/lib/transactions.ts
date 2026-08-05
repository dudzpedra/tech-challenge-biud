export type TransactionStatus = "pendente" | "aprovada" | "rejeitada";

export type Transaction = {
  transactionExternalId: string;
  transactionType: { name: string };
  transactionStatus: { name: TransactionStatus };
  value: string;
  createdAt: string;
};

export type TransactionPage = {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
};

export type TransactionFilters = {
  status?: TransactionStatus;
  type?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export const toSearchParams = (filters: TransactionFilters) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  return params;
};

export const formatCurrency = (value: string) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(value),
  );

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
