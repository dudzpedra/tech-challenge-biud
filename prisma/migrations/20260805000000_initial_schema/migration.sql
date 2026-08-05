CREATE TABLE "TransferType" (
  "id" SERIAL NOT NULL,
  "name" VARCHAR(50) NOT NULL,
  CONSTRAINT "TransferType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TransactionStatus" (
  "id" SERIAL NOT NULL,
  "name" VARCHAR(50) NOT NULL,
  CONSTRAINT "TransactionStatus_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Transaction" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "accountExternalIdDebit" VARCHAR(255) NOT NULL,
  "accountExternalIdCredit" VARCHAR(255) NOT NULL,
  "transferTypeId" INTEGER NOT NULL,
  "value" DECIMAL(10,2) NOT NULL,
  "statusId" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TransferType_name_key" ON "TransferType"("name");
CREATE UNIQUE INDEX "TransactionStatus_name_key" ON "TransactionStatus"("name");
CREATE INDEX "Transaction_statusId_createdAt_idx" ON "Transaction"("statusId", "createdAt");
CREATE INDEX "Transaction_transferTypeId_createdAt_idx" ON "Transaction"("transferTypeId", "createdAt");

ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_transferTypeId_fkey" FOREIGN KEY ("transferTypeId") REFERENCES "TransferType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "TransactionStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
