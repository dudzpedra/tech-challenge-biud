export const formatStatus = (status: string) => status.toUpperCase();

export const listTransactions = (transactions: Array<{ id: string; status: string }>) => ({
  items: transactions,
  total: transactions.length,
});
