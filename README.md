# BIUD — transações assíncronas

Projeto para o desafio técnico Fullstack BIUD. Ele cria transferências, persiste o estado inicial `pendente` e usa Kafka para que o serviço antifraude atualize o resultado de forma assíncrona.

## Componentes

- `apps/transactions-api`: API NestJS, Prisma e consumidor do resultado antifraude.
- `apps/anti-fraud-ms`: microserviço NestJS que aprova valores até R$ 1.000,00 e rejeita os demais.
- `apps/dashboard`: dashboard Next.js/React com Tailwind e TanStack Query.
- `prisma`: schema, migration inicial e seed de tipos/status.

O dashboard faz polling a cada três segundos apenas enquanto houver uma transação pendente na tela. As demais decisões relevantes estão em [DECISIONS.md](./DECISIONS.md).

## Como executar

Pré-requisitos: Node 22+, pnpm 10 e Docker Compose.

```bash
cp .env.example .env
pnpm install
docker compose up -d
pnpm prisma:generate
pnpm exec prisma migrate deploy
pnpm prisma:seed
pnpm build:backends
```

Em três terminais, inicie os processos (a partir da raiz do repositório):

```bash
pnpm --filter @biud/transactions-api start
pnpm --filter @biud/anti-fraud-ms start
pnpm --filter @biud/dashboard dev
```

Os serviços Nest carregam o `.env` da raiz via `node --env-file=../../.env`. Se você alterar variáveis, reinicie os processos. Antes do primeiro `start`, rode `pnpm build:backends` (ou `pnpm quality`, que inclui o build).

Use o dashboard em `http://localhost:3000`. A API fica em `http://localhost:3001`.

## API

`POST /transactions` recebe:

```json
{
  "accountExternalIdDebit": "11111111-1111-1111-1111-111111111111",
  "accountExternalIdCredit": "22222222-2222-2222-2222-222222222222",
  "transferTypeId": 1,
  "value": 120
}
```

- `GET /transactions/:id`: detalhe pelo identificador externo.
- `GET /transactions?status=pendente&type=PIX&from=2026-01-01&to=2026-12-31&page=1&limit=10`: listagem paginada e filtrada.

O evento `transaction.created` carrega o identificador e o valor decimal como string. O antifraude publica `transaction.status.updated` com `aprovada` ou `rejeitada`.

## Qualidade

```bash
pnpm quality
```

O comando executa formatação, lint, typecheck, testes e build para todos os workspaces. O mesmo comando é executado no GitHub Actions. Os hooks Husky validam o formato dos commits e executam formatação e lint antes do commit.

## Limitações conscientes

A publicação Kafka falha de maneira observável no log, mas a evolução indicada para produção é uma transactional outbox com retentativas e idempotência. Ela evitaria a janela entre a gravação no Postgres e a publicação do evento.
