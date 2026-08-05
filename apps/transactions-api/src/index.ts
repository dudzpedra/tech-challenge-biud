export const createTransaction = (body: { accountExternalIdDebit: string; accountExternalIdCredit: string; transferTypeId: number; value: number }) => ({
  status: 'pending',
  transactionExternalId: '00000000-0000-0000-0000-000000000001',
  ...body,
});

export const getTransaction = (transactionExternalId: string) => ({
  transactionExternalId,
  transactionType: { name: 'credit' },
  transactionStatus: { name: 'pending' },
  value: 120,
  createdAt: new Date().toISOString(),
});

export const normalizeTransactionStatus = (status: string) => {
  const normalizedStatus = status.trim().toLowerCase();

  if (
    normalizedStatus === 'approved' ||
    normalizedStatus === 'aproved' ||
    normalizedStatus === 'aprovada'
  ) {
    return 'aprovada';
  }

  if (
    normalizedStatus === 'rejected' ||
    normalizedStatus === 'rejeitada'
  ) {
    return 'rejeitada';
  }

  return 'pendente';
};
