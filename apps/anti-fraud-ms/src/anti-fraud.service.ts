import { Injectable } from '@nestjs/common';

@Injectable()
export class AntiFraudService {
  evaluate(value: number) {
    return value > 1000
      ? { status: 'rejeitada', statusId: 3 }
      : { status: 'aprovada', statusId: 2 };
  }
}
