# Space Missions

Plataforma para gerenciamento de missões espaciais.

O projeto contém uma API em Python, um front-end em React, persistência local com SQLite, Docker Compose e uma automação no n8n para eventos de lançamento de missão.

## Tecnologias

- Python
- FastAPI
- Uvicorn
- React
- TypeScript
- Vite
- Docker
- SQLite
- n8n

## Como rodar

Na raiz do projeto, execute:

```bash
docker compose up --build
```

Serviços disponíveis:

| Serviço | URL |
| --- | --- |
| Front-end | `http://localhost:8080` |
| API | `http://localhost:3001` |
| Documentação da API | `http://localhost:3001/docs` |
| n8n | `http://localhost:5678` |


## Estrutura

```text
space-missions-api/
  app/
    controllers/
      mission_controller.py
    database.py
    exception_handlers.py
    exceptions.py
    main.py
    n8n_notifier.py
    repository.py
    schemas.py
    service.py
  frontend/
    src/
      components/
      constants/
      services/
      types/
      App.tsx
      main.tsx
      styles.css
  n8n/
    mission-launched-workflow.json
  docker-compose.yml
  Dockerfile
  requirements.txt
```

## Backend

A API foi organizada em camadas:

- `main.py`: inicialização da aplicação.
- `controllers/`: rotas HTTP.
- `service.py`: regras de negócio e validações.
- `repository.py`: acesso aos dados.
- `database.py`: conexão e criação da tabela SQLite.
- `schemas.py`: modelos e validação dos dados de entrada.
- `exceptions.py`: exceções da aplicação.
- `exception_handlers.py`: conversão das exceções em respostas HTTP.
- `n8n_notifier.py`: envio do evento de lançamento para o n8n.

Os dados ficam salvos localmente em:

```text
data/missions.db
```

## Front-end

O front-end fica em:

```text
frontend/
```

Ele contém:

- layout responsivo;
- barra lateral fixa;
- cabeçalho;
- lista de missões;
- filtro por status ou ID;
- paginação com 5 ou 10 missões por página;
- modal para criar missão;
- modal para atualizar status;
- link para abrir o n8n pela opção `Automação`.

## Endpoints

### Criar missão

```http
POST /missions
```

Body:

```json
{
  "name": "Apollo X",
  "destination": "Mars",
  "status": "planned"
}
```

Resposta:

```json
{
  "id": 1,
  "name": "Apollo X",
  "destination": "Mars",
  "status": "planned"
}
```

### Listar missões

```http
GET /missions
```

Parâmetros:

| Nome | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `page` | `number` | Não | Página atual. Valor padrão: `1`. |
| `page_size` | `5` ou `10` | Não | Quantidade por página. Valor padrão: `5`. |
| `status` | `planned`, `launched`, `completed`, `failed` | Não | Filtra missões por status. |

Exemplo:

```http
GET /missions?page=1&page_size=5&status=planned
```

Resposta:

```json
{
  "items": [
    {
      "id": 1,
      "name": "Apollo X",
      "destination": "Mars",
      "status": "planned"
    }
  ],
  "page": 1,
  "page_size": 5,
  "total": 1,
  "total_pages": 1
}
```

### Buscar missão por ID

```http
GET /missions/1
```

### Atualizar missão

```http
PATCH /missions/1
```

Body:

```json
{
  "status": "launched"
}
```

## Regras de negócio

- Uma missão só pode ser criada com `status = planned`.
- Os campos `name`, `destination` e `status` não podem ser nulos na criação.
- O nome da missão não pode ser duplicado.
- A atualização aceita apenas os status:
  - `launched`
  - `completed`
  - `failed`
- A missão não pode ser atualizada para o mesmo status atual.
- Missões com status `completed` ou `failed` não podem mudar de status.
- Quando uma missão muda para `launched`, a API envia um webhook para o n8n.
- O n8n registra o evento de lançamento na API em `/events`.

## Automação n8n

O n8n é usado para executar uma automação quando uma missão muda para:

```text
status = launched
```

Fluxo:

1. O n8n recebe um webhook da API.
2. Gera um identificador único para o evento.
3. Registra os dados do evento na execução.
4. Registra o evento real na API:

```text
POST http://api:3000/events
```

### Workflow

O workflow e importado automaticamente quando o container do n8n sobe pelo Docker Compose:

1. O arquivo `n8n/mission-launched-workflow.json` e montado no container.
2. O n8n importa o workflow `Mission Launched Automation`.
3. O workflow e publicado automaticamente e fica ativo para receber o webhook.

Webhook usado pela API dentro do Docker:

```text
http://n8n:5678/webhook/mission-launched
```

### Eventos

Os eventos registrados pelo n8n ficam salvos no SQLite na tabela `mission_events`.

Listar ultimos eventos:

```http
GET /events?limit=20
```

Criar evento:

```http
POST /events
```

Body:

```json
{
  "eventId": "1710000000000-a1b2c3",
  "eventType": "MISSION_LAUNCHED",
  "registeredAt": "2026-07-03T18:00:00.000Z",
  "missionId": 1,
  "missionName": "Apollo X",
  "destination": "Mars",
  "status": "launched"
}
```

## Rodar localmente sem Docker

Backend:

```bash
py -m venv .venv
.venv\Scripts\activate
python -m pip install -r app/requirements.txt
uvicorn app.main:app --reload --port 3001
```

Front-end:

```bash
cd frontend
npm install
npm run dev
```

## Observações

- A pasta `data/` guarda o banco SQLite da API.
- A pasta `n8n-data/` guarda os dados internos do n8n.
- Essas pastas são ignoradas pelo Git.
