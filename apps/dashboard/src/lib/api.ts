import {
  Transaction,
  TransactionFilters,
  TransactionPage,
  toSearchParams,
} from "./transactions";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    throw new Error("Não foi possível concluir a solicitação.");
  }

  return response.json() as Promise<T>;
};

export const listTransactions = (filters: TransactionFilters) =>
  request<TransactionPage>(
    `/transactions?${toSearchParams(filters).toString()}`,
  );

export const getTransaction = (id: string) =>
  request<Transaction>(`/transactions/${id}`);

export const createTransaction = (input: {
  accountExternalIdDebit: string;
  accountExternalIdCredit: string;
  transferTypeId: number;
  value: number;
}) =>
  request<Transaction>("/transactions", {
    method: "POST",
    body: JSON.stringify(input),
  });
