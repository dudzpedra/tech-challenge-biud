import { Controller, Inject, OnModuleInit } from "@nestjs/common";
import { ClientKafka, EventPattern, Payload } from "@nestjs/microservices";
import { AntiFraudService } from "./anti-fraud.service";

@Controller()
export class TransactionCreatedListener implements OnModuleInit {
  constructor(
    private readonly antiFraudService: AntiFraudService,
    @Inject("KAFKA_SERVICE") private readonly client: ClientKafka,
  ) {}

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
    const rawData = message?.value ?? message;

    const transactionValue =
      typeof rawData === "string" ? JSON.parse(rawData) : rawData;
    const value = Number(rawData);

    if (!Number.isFinite(value)) {
      console.error("[AntiFraud] Valor inválido recebido:", transactionValue);
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
