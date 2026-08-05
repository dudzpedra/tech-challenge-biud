import { describe, expect, it } from 'vitest';
import { createTransaction, getTransaction } from './index';

describe('transactions-api', () => {
  it('creates a pending transaction payload', () => {
    const transaction = createTransaction({
      accountExternalIdDebit: '11111111-1111-1111-1111-111111111111',
      accountExternalIdCredit: '22222222-2222-2222-2222-222222222222',
      transferTypeId: 1,
      value: 120,
    });

    expect(transaction.status).toBe('pending');
    expect(transaction.value).toBe(120);
  });

  it('returns a transaction lookup payload', () => {
    const transaction = getTransaction('33333333-3333-3333-3333-333333333333');

    expect(transaction.transactionExternalId).toBe('33333333-3333-3333-3333-333333333333');
    expect(transaction.transactionStatus.name).toBe('pending');
  });
});
