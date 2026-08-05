import { Module } from '@nestjs/common';
import { AntiFraudService } from './anti-fraud.service';
import { TransactionCreatedListener } from './transaction-created.listener';

@Module({
  providers: [AntiFraudService, TransactionCreatedListener],
})
export class AppModule {}
