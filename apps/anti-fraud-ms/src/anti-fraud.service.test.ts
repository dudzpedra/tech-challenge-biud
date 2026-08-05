import { AntiFraudService } from './anti-fraud.service';

describe('AntiFraudService', () => {
  let service: AntiFraudService;

  beforeEach(() => {
    service = new AntiFraudService();
  });

  it('rejects transactions above 1000', () => {
    expect(service.evaluate(1001)).toEqual({ status: 'rejeitada', statusId: 3 });
  });

  it('approves transactions at or below 1000', () => {
    expect(service.evaluate(1000)).toEqual({ status: 'aprovada', statusId: 2 });
    expect(service.evaluate(999)).toEqual({ status: 'aprovada', statusId: 2 });
  });
});
