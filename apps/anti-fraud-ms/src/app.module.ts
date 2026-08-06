import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { AntiFraudService } from "./anti-fraud.service";
import { TransactionCreatedListener } from "./transaction-created.listener";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
                "anti-fraud-client",
              ),
              brokers: configService
                .get<string>("KAFKA_BROKERS", "localhost:9092")
                .split(","),
            },
            consumer: {
              groupId: configService.get<string>(
                "KAFKA_GROUP_ID_ANTI_FRAUD",
                "anti-fraud-consumer",
              ),
            },
          },
        }),
      },
    ]),
  ],
  controllers: [TransactionCreatedListener],
  providers: [AntiFraudService],
})
export class AppModule {}
