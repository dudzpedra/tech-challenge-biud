import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: process.env.KAFKA_CLIENT_ID ?? "anti-fraud-client",
        brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
      },
      consumer: {
        groupId: process.env.KAFKA_GROUP_ID_ANTI_FRAUD ?? "anti-fraud-consumer",
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(
    process.env.ANTI_FRAUD_PORT ? Number(process.env.ANTI_FRAUD_PORT) : 3002,
  );
}

bootstrap();
