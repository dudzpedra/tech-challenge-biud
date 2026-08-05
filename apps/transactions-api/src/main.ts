import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: process.env.DASHBOARD_ORIGIN ?? "http://localhost:3000",
  });
  await app.listen(
    process.env.TRANSACTIONS_PORT
      ? Number(process.env.TRANSACTIONS_PORT)
      : 3001,
  );
}

bootstrap();
