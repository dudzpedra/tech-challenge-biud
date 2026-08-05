import { Injectable, OnModuleInit } from "@nestjs/common";
import { ClientKafka, EventPattern, Payload } from "@nestjs/microservices";
import { AntiFraudService } from "./anti-fraud.service";

@Injectable()
export class TransactionCreatedListener implements OnModuleInit {
  private readonly antiFraudService: AntiFraudService;
  private readonly client: ClientKafka;

  constructor(antiFraudService: AntiFraudService) {
    this.antiFraudService = antiFraudService;
    this.client = new ClientKafka({
      client: {
        clientId: process.env.KAFKA_CLIENT_ID ?? "anti-fraud-client",
        brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
      },
      consumer: {
        groupId: process.env.KAFKA_GROUP_ID_ANTI_FRAUD ?? "anti-fraud-consumer",
      },
    });
  }

  async onModuleInit() {
    await this.client.connect();
  }

  @EventPattern("transaction.created")
  handleTransactionCreated(
    @Payload()
    message: {
      transactionExternalId: string;
      value: string | number;
    },
  ) {
    const value = Number(message.value);

    if (!Number.isFinite(value)) {
      return;
    }

    const result = this.antiFraudService.evaluate(value);

    this.client
      .emit("transaction.status.updated", {
        transactionExternalId: message.transactionExternalId,
        status: result.status,
        statusId: result.statusId,
      })
      .subscribe();

    return result;
  }
}
