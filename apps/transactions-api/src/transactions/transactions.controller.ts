import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { TransactionsService } from "./transactions.service";

@Controller("transactions")
export class TransactionsController {
  private readonly transactionsService: TransactionsService;

  constructor(transactionsService: TransactionsService) {
    this.transactionsService = transactionsService;
  }

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.transactionsService.findOne(id);
  }

  @Get()
  list(
    @Query("status") status?: string,
    @Query("type") type?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("page") page = "1",
    @Query("limit") limit = "10",
  ) {
    return this.transactionsService.list({
      status,
      type,
      from,
      to,
      page: Number(page),
      limit: Number(limit),
    });
  }
}
