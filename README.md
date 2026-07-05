# Space Missions

Plataforma para gerenciamento de missões espaciais.

O projeto contém uma API em Python/FastAPI, um front-end em React, persistência local com SQLite, Docker Compose, manifests Kubernetes e uma automação no n8n para registrar eventos de lançamento de missão.

## Tecnologias

- Python
- FastAPI
- Uvicorn
- React
- TypeScript
- Vite
- Docker
- Docker Compose
- SQLite
- n8n
- Kubernetes
- GitHub Actions
- Ruff

## Como rodar com Docker

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
space-missions/
  .github/
    workflows/
      ci.yaml
  app/
    controllers/

      mission_controller.py
    database.py
    exception_handlers.py
    exceptions.py
    main.py
    n8n_notifier.py
    repository.py
    requirements.txt
    requirements-dev.txt
    schemas.py
    service.py
    Dockerfile
  frontend/
    public/
    src/
      components/
      constants/
      services/
      types/
      App.tsx
      config.ts
      main.tsx
      styles.css
    Dockerfile
    docker-entrypoint.sh
    package.json
    package-lock.json
    vite.config.ts
  k8s/
    backend/
      configmap-back.yaml
      deployment.yaml
      ingress.yaml
      namespace.yaml
      pvc.yaml
      secret.yaml
      service-back.yaml
    frontend/
      configmap-front.yaml
      deployment.yaml
      ingress-front.yaml
      namespace.yaml
      service.yaml
    n8n/
      configmap.yaml
      configmap-file.yaml
      deployment.yaml
      ingress-n8n.yaml
      namespace.yaml
      pvc.yaml
      secret.yaml
      service.yaml
  n8n/
    mission-launched-workflow.json
  docker-compose.yml
  pyproject.toml
  README.md

```

## Backend

A API fica em `app/` e foi organizada em camadas:

- `main.py`: inicialização da aplicação FastAPI.
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

O front-end fica em `frontend/`.

Ele contém:

- layout responsivo;
- barra lateral fixa;
- cabeçalho;
- lista de missões;
- filtro por status ou ID;
- paginação com 5 ou 10 missões por página;
- modal para criar missão;
- modal para atualizar status;
- painel de eventos;
- link para abrir o n8n.

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

### Listar eventos

```http
GET /events?limit=20
```

### Criar evento interno

```http
POST /events
```

Esse endpoint exige o header:

```http
X-Internal-Token: <token>
```

## Regras de negócio

- Uma missão só pode ser criada com `status = planned`.
- `name`, `destination` e `status` são obrigatórios na criação.
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

## Kubernetes

Os manifests ficam em:

```text
k8s/
```

Eles estão separados por componente:

```text
k8s/
  backend/
    configmap-back.yaml
    deployment.yaml
    ingress.yaml
    namespace.yaml
    pvc.yaml
    secret.yaml
    service-back.yaml
  frontend/
    configmap-front.yaml
    deployment.yaml
    ingress-front.yaml
    namespace.yaml
    service.yaml
  n8n/
    configmap.yaml
    configmap-file.yaml
    deployment.yaml
    ingress-n8n.yaml
    namespace.yaml
    pvc.yaml
    secret.yaml
    service.yaml
```

# Teste local com port-forward

Tambem e possivel testar os Services do Kubernetes sem usar o Ingress.

Como o front-end usa os hosts do Ingress por padrao, ajuste temporariamente o
ConfigMap para apontar para as portas locais

Em terminais separados, execute:

```bash
kubectl -n backend port-forward svc/backend-service 3001:3001
kubectl -n frontend port-forward svc/frontend-service 8080:80
kubectl -n n8n port-forward svc/service-n8n 5678:5678
```

URLs para teste:

| Servico | URL |
| --- | --- |
| Front-end | `http://localhost:8080` |
| API | `http://localhost:3001` |
| n8n | `http://localhost:5678` |

Teste rapido da API:

```bash
curl "http://localhost:3001/missions"
```

### Validação do Ingress

A validação do Ingress foi feita a partir de um pod temporário dentro do cluster, usando a imagem `curlimages/curl`.
Como os domínios `space-missions.test`, `api.space-missions.test` e `n8n.space-missions.test` são resolvidos pelo Ingress, os testes foram feitos enviando o header `Host` correspondente para o serviço interno do `ingress-nginx`.
Todos os serviços responderam com HTTP 200 via `ingress-nginx`.

Front-end:

```bash
kubectl run curl-test --rm -it --restart=Never --image=curlimages/curl -- \
  curl -vi http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/ \
  -H "Host: space-missions.test"
```

API:

```bash
kubectl run curl-test --rm -it --restart=Never --image=curlimages/curl -- \
  curl -vi "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/missions?page=1&page_size=5" \
  -H "Host: api.space-missions.test"
```

n8n:

```bash
kubectl run curl-test --rm -it --restart=Never --image=curlimages/curl -- \
  curl -vi http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/ \
  -H "Host: n8n.space-missions.test"
```

### Secrets

O backend e o n8n usam `EVENTS_API_TOKEN`.

Como os componentes estão em namespaces diferentes, existem Secrets separados:

- `k8s/backend/secret.yaml`
- `k8s/n8n/secret.yaml`

Para ambiente real, o ideal é não versionar tokens verdadeiros no Git. Use valores de exemplo no repositório e crie os Secrets reais diretamente no cluster.


## Qualidade e CI

O projeto usa GitHub Actions em:

```text
.github/workflows/ci.yaml
```
A CI detecta quais partes do projeto mudaram e executa apenas os jobs necessários.
Atualmente, o projeto ainda não possui uma pasta de testes dedicada para backend e front-end.
Por isso, a pipeline do GitHub Actions executa validações básicas para garantir que as principais partes do projeto
Essas validações funcionam como tests iniciais. Elas não substituem uma pasta completa de testes, mas ajudam a identificar rapidamente problemas de build, lint, configuração e inicialização da aplicação.


### Backend

Quando há mudanças em `app/` ou `pyproject.toml`, a CI:

- instala `app/requirements-dev.txt`;
- executa `ruff check app`;
- faz um test básico da API;
- compila os arquivos Python;
- valida se o app FastAPI pode ser importado.

Comandos locais:

```bash
python -m pip install -r app/requirements-dev.txt
python -m ruff check app
python -m compileall app
```

### Front-end

Quando há mudanças em `frontend/`, a CI:

- instala dependências com `npm ci`;
- executa lint se existir script configurado;
- gera o build de produção;
- valida se o bundle foi criado.

Comandos locais:

```bash
cd frontend
npm install
npm run build
```

### Kubernetes

Quando há mudanças em `k8s/`, a CI valida os manifests com `kubeconform`.

### Docker

A CI valida se as imagens Docker conseguem ser construídas.

Ela não publica imagens, não altera manifests Kubernetes e não faz deploy automático.

Comandos locais:

```bash
docker build -f app/Dockerfile -t space-missions-backend:ci .
docker build -t space-missions-frontend:ci frontend
```

## Observações

- A pasta `data/` guarda o banco SQLite da API.
- A pasta `n8n-data/` guarda os dados internos do n8n.
- Essas pastas são ignoradas pelo Git.

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

### Evoluções Futuras

Algumas melhorias podem ser consideradas para evoluir a plataforma:

- Adicionar monitoramento e observabilidade com ferramentas como Prometheus e Grafana, permitindo acompanhar metricas, uso de recursos, disponibilidade dos serviços e saúde do ambiente.
- Substituir o SQLite por um banco de dados mais adequado para produção, como PostgreSQL ou MySQL, melhorando escalabilidade, concorrência e persistência em ambientes distribuídos.
- Colocar um sistema de mensageria, como RabbitMQ ou Kafka, para separar o processamento de eventos, evitar perda e duplicidade de mensagens.
- Implantar a solução em um ambiente cloud, como AWS, usando serviços gerenciados para banco de dados, containers, monitoramento, rede e armazenamento.
