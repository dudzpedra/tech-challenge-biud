import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TransactionFilters } from "../../lib/transactions";
import { createTransaction, listTransactions } from "../../lib/api";

export function useTransactionsQuery(filters: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => listTransactions(filters),
    refetchInterval: (query) =>
      query.state.data?.items.some(
        (item) => item.transactionStatus.name === "pendente",
      )
        ? 3000
        : false,
  });
}

export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
