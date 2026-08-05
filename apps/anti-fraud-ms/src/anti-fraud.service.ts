import { Injectable } from '@nestjs/common';

@Injectable()
export class AntiFraudService {
  evaluate(value: number) {
    if (value > 1000) {
      return {
        approved: false,
        status: 'rejeitada',
        statusId: 3,
      };
    }

    return {
      approved: true,
      status: 'aprovada',
      statusId: 2,
    };
  }
}
