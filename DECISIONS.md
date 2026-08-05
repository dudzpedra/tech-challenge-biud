## Decisão 5 — Falhas na publicação Kafka

**Decisão:** persistir a transação como `pendente` e registrar a falha de publicação sem devolver erro para a criação; em produção, evoluir este ponto para uma transactional outbox com retentativas.

**Alternativas consideradas:** falhar a requisição quando o Kafka estiver indisponível ou fazer a publicação síncrona antes da gravação.

**Por quê:** a criação representa um fato de negócio e não deve desaparecer por indisponibilidade temporária do broker. A outbox remove a janela entre o commit no banco e a publicação, mas adiciona uma tabela, worker e idempotência que não cabem no escopo inicial. O log deixa a falha observável e a transação continua claramente pendente para reconciliação.

## Decisão 1 — Monorepo com pnpm

**Decisão:** manter o projeto em um único repositório monorepo, organizado por `apps/*` e `packages/*`, com `pnpm` como gerenciador de workspace.

**Alternativas consideradas:** múltiplos repositórios isolados por serviço e um monorepo com `npm` ou `yarn`.

**Por quê:** o escopo do desafio exige coexistência entre API, microserviço antifraude, dashboard e infraestrutura compartilhada. O monorepo reduz a duplicação de configuração, centraliza o quality gate e mantém o ciclo de build, teste e lint coerente entre os serviços.

## Decisão 2 — Contrato dos eventos Kafka

**Decisão:** usar eventos JSON com identificador externo da transação, valor e metadados mínimos do domínio.

### `transaction.created`

```json
{
  "transactionExternalId": "<uuid>",
  "accountExternalIdDebit": "<uuid>",
  "accountExternalIdCredit": "<uuid>",
  "transferTypeId": 1,
  "value": "120.00",
  "status": "pendente"
}
```

### `transaction.status.updated`

```json
{
  "transactionExternalId": "<uuid>",
  "status": "aprovada",
  "statusId": 2
}
```

**Alternativas consideradas:** enviar eventos com objetos completos, usar apenas `id`/`status` ou serializar tudo em formato binário.

**Por quê:** o payload JSON é o ponto de equilíbrio entre legibilidade, compatibilidade com Kafka e evolução incremental do contrato. O identificador externo da transação é obrigatório para o `transactions-api` atualizar o registro correto após a decisão antifraude. A string de `value` é usada para preservar a precisão decimal sem perda de representação ao viajar entre camadas.

## Decisão 3 — Estratégia do Dashboard para atualização assíncrona

**Decisão:** usar polling com React Query/TanStack Query na camada de UI para atualizar o status de transações pendentes.

**Alternativas consideradas:** SWR puro, SSE, WebSocket e polling sem cache.

**Por quê:** o cenário apresentado tem baixa a média concorrência de transações pendentes simultâneas e o status muda após um evento de negócio, não em um fluxo de tempo real contínuo. O TanStack Query já oferece cache, revalidação, sincronização e estados de carregamento/erro/vazio de maneira previsível. Em um volume muito alto, o custo do polling cresce e a plataforma passa a valer uma troca por canal de eventos. Para o desafio, o polling mantém a implementação simples e confiável.

## Decisão 4 — Resposta para alta concorrência de leitura e escrita

**Decisão:** em um cenário com alta concorrência, a composição recomendada é combinar `Kafka` para desacoplamento do fluxo de escrita, réplicas de leitura no Postgres para aliviar pressão de consultas, cache em Redis para leituras repetidas e CQRS para separar leitura e escrita em padrões diferentes.

### Como isso se comporta no desenho

- **Kafka:** desacopla a criação da transação da decisão antifraude. Ele atua como buffer de eventos e tolera picos de escrita sem bloquear o lado de negócio imediato.
- **Postgres:** usa `READ REPLICA` para consultas de listagem e detalhamento, mantendo as escritas no primário. Isso reduz a carga no nó de escrita e melhora a latência média de leitura.
- **Redis:** armazena resultados de consultas frequentes, especialmente listagens paginadas e agregados de status, adicionando cache de resposta e reduzindo leituras repetidas no banco.
- **CQRS:** separa comandos (`create`, `update status`) de consultas (`list`, `findById`) para permitir otimização independente por capacidade e latência.

**Alternativas consideradas:** apenas sharding no Kafka, apenas cache em Redis, ou tentar escalar a escrita e a leitura com um único banco sem desacoplamento.

**Por quê:** sharding no Kafka ajuda a distribuir a carga de tópicos, mas não resolve a pressão de leitura e de consulta em si. Leitura em réplicas reduz a sobrecarga do primário; cache em Redis reduz o custo de consultas repetidas; CQRS separa o desenho operacional do desenho de consulta. Juntos, esses mecanismos convergem para o comportamento esperado em um sistema com pico de escrita e leitura simultânea.
