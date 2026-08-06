import { Module } from "@nestjs/common";
import { TransactionsController } from "./transactions.controller";
import { TransactionStatusConsumer } from "./kafka/transaction-status.consumer";
import { TransactionsService } from "./transactions.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "KAFKA_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: configService.get<string>(
                "KAFKA_CLIENT_ID",
                "tech-challenge",
              ),
              brokers: [
                configService.get<string>("KAFKA_BROKERS", "localhost:9092"),
              ],
            },
            consumer: {
              groupId: configService.get<string>(
                "KAFKA_GROUP_ID_TRANSACTIONS",
                "transactions-consumer",
              ),
            },
          },
        }),
      },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionStatusConsumer],
})
export class TransactionsModule {}
