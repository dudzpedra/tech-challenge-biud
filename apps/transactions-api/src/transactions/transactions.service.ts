import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
} from "@nestjs/common";
import { Kafka } from "kafkajs";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { normalizeTransactionStatus } from "../index";
import { CreateTransactionDto } from "./dto/create-transaction.dto";

@Injectable()
export class TransactionsService implements OnModuleDestroy {
  private readonly logger = new Logger(TransactionsService.name);
  private readonly prisma: PrismaClient;
  private readonly kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID ?? "tech-challenge",
    brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
  });
  private readonly producer = this.kafka.producer();

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    this.prisma = new PrismaClient({ adapter });
  }

  async create(dto: CreateTransactionDto) {
    const created = await this.prisma.transaction.create({
      data: {
        accountExternalIdDebit: dto.accountExternalIdDebit,
        accountExternalIdCredit: dto.accountExternalIdCredit,
        transferTypeId: dto.transferTypeId,
        value: new Prisma.Decimal(dto.value),
        statusId: 1,
      },
      include: {
        status: true,
        transferType: true,
      },
    });

    try {
      await this.producer.connect();
      await this.producer.send({
        topic: "transaction.created",
        messages: [
          {
            key: created.id,
            value: JSON.stringify({
              transactionExternalId: created.id,
              accountExternalIdDebit: created.accountExternalIdDebit,
              accountExternalIdCredit: created.accountExternalIdCredit,
              transferTypeId: created.transferTypeId,
              value: created.value.toString(),
              status: created.status.name,
            }),
          },
        ],
      });
    } catch (error) {
      this.logger.error(
        `Could not publish transaction.created for ${created.id}`,
        error,
      );
    }

    return this.toResponse(created);
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { status: true, transferType: true },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    return this.toResponse(transaction);
  }

  async updateStatusByExternalId(
    transactionExternalId: string,
    status: string,
  ) {
    const normalizedStatus = normalizeTransactionStatus(status);

    if (!normalizedStatus) {
      this.logger.warn(`Ignoring unknown transaction status: ${status}`);
      return;
    }

    const statusRecord = await this.prisma.transactionStatus.findUnique({
      where: { name: normalizedStatus },
    });

    if (!statusRecord) {
      return;
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionExternalId },
    });

    if (!transaction) {
      return;
    }

    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { statusId: statusRecord.id },
    });
  }

  async list(filters: {
    status?: string;
    type?: string;
    from?: string;
    to?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.TransactionWhereInput = {};

    if (filters.status) {
      where.status = {
        is: {
          name: filters.status,
        },
      };
    }

    if (filters.type) {
      where.transferType = {
        is: {
          name: filters.type,
        },
      };
    }

    if (filters.from || filters.to) {
      where.createdAt = {
        gte: filters.from ? new Date(filters.from) : undefined,
        lte: filters.to ? new Date(filters.to) : undefined,
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: { status: true, transferType: true },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toResponse(item)),
      total,
      page: filters.page,
      limit: filters.limit,
    };
  }

  async onModuleDestroy() {
    await Promise.all([this.producer.disconnect(), this.prisma.$disconnect()]);
  }

  private toResponse(
    transaction: Prisma.TransactionGetPayload<{
      include: { status: true; transferType: true };
    }>,
  ) {
    return {
      transactionExternalId: transaction.id,
      transactionType: { name: transaction.transferType.name },
      transactionStatus: { name: transaction.status.name },
      value: transaction.value.toString(),
      createdAt: transaction.createdAt,
    };
  }
}
