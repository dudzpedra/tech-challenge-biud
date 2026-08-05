import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionStatusConsumer } from './kafka/transaction-status.consumer';
import { TransactionsService } from './transactions.service';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionStatusConsumer],
})
export class TransactionsModule {}
