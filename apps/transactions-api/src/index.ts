export const normalizeTransactionStatus = (
  status: string,
): string | undefined => {
  const normalizedStatus = status.trim().toLowerCase();

  if (
    normalizedStatus === "approved" ||
    normalizedStatus === "aproved" ||
    normalizedStatus === "aprovada"
  ) {
    return "aprovada";
  }

  if (normalizedStatus === "rejected" || normalizedStatus === "rejeitada") {
    return "rejeitada";
  }

  if (normalizedStatus === "pending" || normalizedStatus === "pendente") {
    return "pendente";
  }

  return undefined;
};
