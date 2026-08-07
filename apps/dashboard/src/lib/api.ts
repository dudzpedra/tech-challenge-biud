import axios from "axios";
import {
  Transaction,
  TransactionFilters,
  TransactionPage,
  toSearchParams,
} from "./transactions";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const listTransactions = async (filters: TransactionFilters) => {
  const { data } = await api.get<TransactionPage>(
    `/transactions?${toSearchParams(filters).toString()}`,
  );
  return data;
};

export const getTransaction = async (id: string) => {
  const { data } = await api.get<Transaction>(`/transactions/${id}`);
  return data;
};

export const createTransaction = async (input: {
  accountExternalIdDebit: string;
  accountExternalIdCredit: string;
  transferTypeId: number;
  value: number;
}) => {
  const { data } = await api.post<Transaction>("/transactions", input);
  return data;
};
