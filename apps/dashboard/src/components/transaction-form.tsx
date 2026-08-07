"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw } from "lucide-react";
import { Resolver, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { useCreateTransactionMutation } from "../app/hooks/use-transactions";
import { toast, Toaster } from "sonner";

const transactionSchema = z
  .object({
    accountExternalIdDebit: z.uuid("Insira um UUID de débito válido"),
    accountExternalIdCredit: z.uuid("Insira um UUID de crédito válido"),
    transferTypeId: z.coerce
      .number()
      .min(1, "Selecione o tipo de transferência"),
    value: z.coerce.number().positive("O valor deve ser maior que zero"),
  })
  .refine(
    (data) => data.accountExternalIdDebit !== data.accountExternalIdCredit,
    {
      message: "As contas de débito e crédito devem ser diferentes",
      path: ["accountExternalIdCredit"],
    },
  );

type TransactionFormData = z.infer<typeof transactionSchema>;

export function TransactionForm() {
  const createMutation = useCreateTransactionMutation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema) as Resolver<TransactionFormData>,
    defaultValues: {
      accountExternalIdDebit: uuidv4(),
      accountExternalIdCredit: uuidv4(),
      transferTypeId: 1,
      value: 120,
    },
  });

  const generateNewUuid = (
    field: "accountExternalIdDebit" | "accountExternalIdCredit",
  ) => {
    setValue(field, uuidv4(), { shouldValidate: true });
  };

  const onSubmit = (data: TransactionFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        reset({
          accountExternalIdDebit: uuidv4(),
          accountExternalIdCredit: uuidv4(),
          transferTypeId: 1,
          value: 120,
        });
      },
      onError: (error) => {
        console.error(error);
        toast.error("Erro ao criar transação: " + error.message);
      },
    });
  };

  return (
    <section className="card">
      <Toaster />
      <h2 className="card-title">Nova transação</h2>
      <form
        className="grid items-end gap-4 md:grid-cols-2 lg:grid-cols-[2fr_2fr_1fr_1fr]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <label className="block">
          <div className="flex items-center gap-1 mb-1">
            <span className="field-label">Conta de débito</span>
            <button
              type="button"
              onClick={() => generateNewUuid("accountExternalIdDebit")}
              title="Redefinir UUID"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          <input
            {...register("accountExternalIdDebit")}
            placeholder="UUID da conta de débito"
            className={errors.accountExternalIdDebit ? "border-red-500" : ""}
          />
          {errors.accountExternalIdDebit && (
            <span className="text-xs text-red-500">
              {errors.accountExternalIdDebit.message}
            </span>
          )}
        </label>

        <label className="block">
          <div className="flex items-center gap-1 mb-1">
            <span className="field-label">Conta de crédito</span>
            <button
              type="button"
              onClick={() => generateNewUuid("accountExternalIdCredit")}
              title="Redefinir UUID"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          <input
            {...register("accountExternalIdCredit")}
            placeholder="UUID da conta de crédito"
            className={errors.accountExternalIdCredit ? "border-red-500" : ""}
          />
          {errors.accountExternalIdCredit && (
            <span className="text-xs text-red-500">
              {errors.accountExternalIdCredit.message}
            </span>
          )}
        </label>

        <label className="block">
          <span className="field-label !mb-3">Tipo</span>
          <select {...register("transferTypeId")}>
            <option value="1">PIX</option>
            <option value="2">TED</option>
          </select>
          {errors.transferTypeId && (
            <span className="text-xs text-red-500">
              {errors.transferTypeId.message}
            </span>
          )}
        </label>

        <label className="block">
          <span className="field-label !mb-3">Valor (R$)</span>
          <input
            type="number"
            step="0.01"
            placeholder="0,00"
            {...register("value")}
            className={errors.value ? "border-red-500" : ""}
          />
          {errors.value && (
            <span className="text-xs text-red-500">{errors.value.message}</span>
          )}
        </label>

        <div className="flex flex-wrap items-center gap-3 md:col-span-2 lg:col-span-4">
          <button
            disabled={createMutation.isPending}
            type="submit"
            className="btn btn-primary cursor-pointer"
          >
            {createMutation.isPending ? "Criando…" : "Criar transação"}
          </button>
          <p className="text-xs text-slate-500">
            Valores acima de R$ 1.000,00 são rejeitados pelo antifraude.
          </p>
        </div>

        {createMutation.isError && (
          <p className="alert-error md:col-span-2 lg:col-span-4" role="alert">
            {createMutation.error.message}
          </p>
        )}
      </form>
    </section>
  );
}
