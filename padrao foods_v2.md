# Padrão FOODS — Guia Enxuto (React + Node/Express + MySQL)

## Objetivo
Padronizar implementação e refatoração para:
- reduzir duplicação,
- manter arquivos curtos e previsíveis,
- garantir legibilidade e manutenção,
- orientar o Cursor a entregar mudanças com **mínimo de tokens** e **máxima clareza**.

---

## Princípios
- **Uma responsabilidade por arquivo** (UI ≠ regra de negócio; controller ≠ validação; rota ≠ implementação).
- **Concisão com clareza**: modularizar antes de crescer.
- **Reuso > repetição**: extrair padrões para componentes, hooks, utils, services e repositories.
- **Contratos explícitos**: respostas/erros consistentes e testáveis.
- **Dados primeiro**: decisões de performance (índices/paginação) fazem parte do “padrão”, não são “otimização depois”.

---

## Limites objetivos de tamanho
- Página (React): **≤ 200 linhas** (exceção justificada: até 300).
- Componente UI: **≤ 150 linhas**.
- Hook: **≤ 120 linhas**.
- Service (frontend ou backend): **≤ 150 linhas**.
- Controller (por método): **≤ 80 linhas**.
- Repository (por método): **≤ 80 linhas** (queries complexas devem ser isoladas e documentadas).

---

## Política de comentários (curtos e úteis)
Comentar apenas quando agregar contexto que o código não explica sozinho:
- **regra de negócio** (por quê),
- **decisão não óbvia** (tradeoff),
- **edge case** relevante.
Evitar comentar o óbvio; preferir nomes autoexplicativos.

---

# Convenções obrigatórias (reduzem divergência)

## Nomenclatura
- Componentes React: **PascalCase** (`ProdutoModal`).
- Hooks: `use<Verbo><Objeto>` (`useProdutoForm`).
- Services: `<entidade>.service` (ex.: `produtos.service`).
- Repositories: `<entidade>.repo` (ex.: `produtos.repo`).
- Rotas: plural e REST (`/produtos`, `/fornecedores/:id`).

## Imports e exports
- Evitar “barrel exports” indiscriminado. Se usar, limitar a `index.ts` apenas em `components/ui` e `services`.
- Imports em ordem: libs externas → internos (aliases) → relativos.
- Evitar circular dependency; se ocorrer, refatorar (não “contornar”).

---

# Estrutura padrão

## Frontend (React)
Organizar por **entidade/domínio** e separar UI de lógica:

- `src/pages/<entidade>/` — páginas (orquestração e layout)
- `src/components/<entidade>/` — UI da entidade
- `src/components/ui/` — componentes genéricos reutilizáveis
- `src/components/modals/` — modais padronizados
- `src/services/` — comunicação com backend (por entidade)
- `src/hooks/<entidade>/` — hooks específicos (form, api, calculations)
- `src/utils/` — formatadores e helpers
- `src/contexts/` — auth/permissões

### Regras obrigatórias (Frontend)
- Páginas não carregam regra de negócio complexa.
- Repetição de campos/inputs: criar **Field Components** genéricos (text, select, number, money, percent).
- Chamadas HTTP apenas em `services/` (ou hook que delega para service).
- Formatação (moeda, percent, datas) centralizada em `utils/`.
- Responsividade: layout deve se adaptar sem “quebrar” conteúdo.
- Padronização visual: Tailwind; evitar estilos ad-hoc sem justificativa.

---

## Backend (Node/Express)
Separar rota, validação, controller, service/usecase e camada de dados:

- `routes/<entidade>/` — definição de endpoints
- `middleware/` — auth, pagination, responseHandler, errorHandler, validation, rate-limit
- `controllers/` — orquestração do request (sem regra pesada)
- `services/` ou `usecases/` — regra de negócio e composição
- `repositories/` — acesso a dados (SQL/queries), isolado
- `utils/` — helpers (format, audit, etc.)

### Regras obrigatórias (Backend)
- RESTful (métodos corretos, recursos claros).
- Controller **não** valida payload e **não** acessa banco diretamente.
- Validação como middleware (body/query/params).
- Regras de negócio em service/usecase quando:
  - houver composição de múltiplas operações,
  - houver lógica de cálculo/decisão,
  - o controller ultrapassar o limite.
- Acesso ao banco somente em repository/DAO.
- Paginação obrigatória em listagens (quando aplicável).
- Rate limit: obrigatório em rotas públicas/sensíveis.

---

# Contratos (evitam retrabalho)

## Respostas (API)
Formato único de sucesso e erro, consistente em todas as rotas.
- Sucesso: `statusCode`, `mensagem`, `dados`
- Listagens paginadas: `items`, `page`, `pageSize`, `totalItems`, `totalPages`

## Erros (API)
Normalização via `errorHandler` (sem mensagens soltas).
- 400 validação
- 401 autenticação
- 403 autorização
- 404 não encontrado
- 409 conflito
- 500 interno

## Validação
- Validar body/query/params com schema.
- Falhar com mensagem curta e específica (campo + motivo).
- Não duplicar validação no controller.

---

# Observabilidade mínima (produção)
- Logging estruturado por request:
  - `requestId`, `userId` (quando houver), rota, status, latência.
- Níveis:
  - `info` para fluxo normal,
  - `warn` para situações recuperáveis,
  - `error` para falhas.
- Evitar `console.log` em produção; usar logger padrão do projeto.

---

# Padrões MySQL (obrigatórios)
- Charset/collation padrão: **utf8mb4**.
- Usar **prepared statements**/parametrização sempre.
- Evitar `SELECT *` em listagens; selecionar apenas colunas necessárias.
- Índices:
  - indexar colunas de filtro, join, ordenação e FK.
- Paginação:
  - usar `LIMIT/OFFSET` quando simples;
  - considerar cursor/“seek pagination” quando performance exigir.
- Transações:
  - usar transação em operações compostas (múltiplas escritas que precisam ser atômicas).
- Migrar com cuidado:
  - alterações de schema devem ser rastreáveis (scripts/migrations).


# Modelagem de dados (MySQL)
- Preferir **normalização** para dados transacionais (fonte da verdade): tabelas por entidade + FKs.
- **Evitar colunas multi-valor** (CSV tipo `"1,2,3"` / `FIND_IN_SET`) quando precisar filtrar/joinar. Use **tabela de relacionamento** (N:N) ou FK (1:N).
- **Evitar tabelas muito largas** com muitas colunas opcionais `NULL` por “subtipos”. Opções:
  - separar em tabela detalhe 1:1 (`<entidade>_detalhes`) quando é bloco opcional;
  - ou criar tabelas por subtipo quando as regras divergem (ex.: `produto_alimento`, `produto_limpeza`).
- **Denormalização** é permitida para leitura/BI (tabelas de resumo/materializadas), desde que:
  - a fonte da verdade continue normalizada;
  - exista estratégia de atualização (job/trigger/refresh) e validação de consistência.
- Chaves/constraints:
  - PK estável (surrogate) + UNIQUE onde houver chave natural;
  - toda FK deve ter índice e regra clara de `ON UPDATE/ON DELETE`.

---

# Regras de refatoração (quando mexer em código existente)
1. Não mudar comportamento sem requisito explícito.
2. Se exceder limites:
   - extrair UI repetida para componentes;
   - extrair regras para hooks/services/usecases;
   - extrair queries para repositories.
3. Centralizar:
   - formatação em utils,
   - HTTP em services,
   - SQL em repositories,
   - regra de negócio em service/usecase.
4. Evitar efeitos colaterais escondidos (mutação silenciosa / dependências globais).

---

# Segurança (mínimo)
- Autenticação e autorização claras (401 vs 403).
- Rate limit em rotas sensíveis.
- Validar e sanitizar entradas sempre.
- Não expor detalhes internos no erro (stacktrace) fora de ambiente dev.

---


---

# Diretrizes para Vibecoding (Cursor)

## Contrato mínimo de entrega (obrigatório em toda task/PR)
Ao finalizar qualquer ajuste, entregar sempre:
- **O que mudou** (1–3 bullets)
- **O que não mudou** (1 bullet)
- **Critérios de aceite** (3–5 bullets, objetivos)
- **Impacto em performance**: Sim/Não + 1 linha justificando

## Fonte da verdade (evitar “lógica espalhada”)
- **Cálculo/normalização de dados**: `hooks/` (frontend) e `services/usecases/` (backend), nunca em componentes de UI.
- **Formatação de exibição** (moeda, %, datas): centralizada em `utils/formatters` (ou equivalente), nunca duplicada em múltiplos componentes.
- **HTTP**: somente em `services/` (frontend). Componentes não chamam API diretamente.

## Regra anti-deriva de padrão
- Se já existir um padrão equivalente (modal, tabela, card, hook, service), **reutilizar/estender**.
- Não criar “segunda versão” com nome/estrutura diferente para o mesmo problema sem justificativa explícita.

## MySQL (produção)
- Para qualquer listagem usada em produção: **paginação + índice** no filtro/ordenação principal fazem parte do requisito (não é “otimização depois”).


# Checklist de aceite (PR)
- [ ] Entregue "O que mudou" e "O que não mudou" (conforme contrato mínimo)
- [ ] Critérios de aceite objetivos (3–5) informados
- [ ] Impacto em performance avaliado (Sim/Não + justificativa)
- [ ] Cálculo/normalização fora de componentes de UI; formatação centralizada
- [ ] Para listagens: paginação aplicada e índice verificado no filtro principal
- [ ] Padrão existente reutilizado (sem criar variação paralela)
- [ ] Arquivos dentro dos limites (ou exceção justificada).
- [ ] UI separada de regra de negócio.
- [ ] Controller enxuto (sem validação/SQL/regras extensas).
- [ ] SQL isolado em repositories.
- [ ] Respostas e erros seguem contrato único.
- [ ] Listagens com paginação (quando aplicável).
- [ ] Índices e colunas selecionadas corretamente (sem `SELECT *` em listagem).
- [ ] Logs essenciais presentes (requestId/latência/status).
- [ ] Reuso aplicado onde havia repetição.
- [ ] Comentários apenas onde agregam.

---

## Nota para economia de tokens no Cursor
Ao abrir tarefa no Cursor, use:
- **Contexto (1–2 linhas)** + **Regra central** + **Critérios de aceite**.
Evite exemplos longos; inclua apenas validações objetivas e mensuráveis.