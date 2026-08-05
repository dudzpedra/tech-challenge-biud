import { Injectable, OnModuleInit } from '@nestjs/common';
import { EachMessagePayload, Kafka } from 'kafkajs';
import { TransactionsService } from '../transactions.service';

@Injectable()
export class TransactionStatusConsumer implements OnModuleInit {
  private readonly transactionsService: TransactionsService;

  private readonly kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID ?? 'tech-challenge',
    brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
  });

  private readonly consumer = this.kafka.consumer({
    groupId: process.env.KAFKA_GROUP_ID_TRANSACTIONS ?? 'transactions-consumer',
  });

  constructor(transactionsService: TransactionsService) {
    this.transactionsService = transactionsService;
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'transaction.status.updated', fromBeginning: false });
    await this.consumer.run({
      eachMessage: async ({ message }: EachMessagePayload) => {
        const content = message.value ? message.value.toString() : '';
        const payload = JSON.parse(content) as {
          transactionExternalId?: string;
          status?: string;
        };

        if (payload.transactionExternalId && payload.status) {
          await this.transactionsService.updateStatusByExternalId(
            payload.transactionExternalId,
            payload.status,
          );
        }
      },
    });
  }
}
