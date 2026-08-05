import { Type } from "class-transformer";
import { IsInt, IsNumber, IsPositive, IsUUID, Max, Min } from "class-validator";

export class CreateTransactionDto {
  @IsUUID()
  accountExternalIdDebit!: string;

  @IsUUID()
  accountExternalIdCredit!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  transferTypeId!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99999999.99)
  value!: number;
}
