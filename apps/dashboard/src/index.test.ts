import { describe, expect, it } from 'vitest';
import { formatStatus, listTransactions } from './index';

describe('dashboard', () => {
  it('formats status to uppercase', () => {
    expect(formatStatus('pending')).toBe('PENDING');
  });

  it('returns list metadata for the dashboard', () => {
    const result = listTransactions([{ id: '1', status: 'pending' }]);

    expect(result.total).toBe(1);
    expect(result.items[0].status).toBe('pending');
  });
});
