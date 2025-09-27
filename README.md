# API Gateway Simples

Um API Gateway minimalista construído com Hono.js para roteamento de requisições para microserviços.

## Funcionalidades

- 🚀 Roteamento simples e rápido
- 🔄 Proxy de requisições para microserviços
- ⏱️ Timeout configurável por serviço
- 🛡️ Tratamento de erros robusto
- 📊 Endpoint de health check
- 🌐 CORS configurável
- 📝 Logs de requisições

## Instalação

```bash
npm install
```

## Configuração

Edite o arquivo `src/config.ts` para configurar seus serviços:

```typescript
export const serviceConfig: ServiceRoute[] = [
  {
    path: '/api/users/*',
    target: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    timeout: 5000
  }
]
```

## Uso

### Desenvolvimento (Cloudflare Workers)
```bash
npm install
npm run dev
```

O comando acima usa `wrangler dev`, que emula o ambiente dos Workers localmente. Para sobrescrever variáveis de ambiente apenas na sua máquina, crie um arquivo `wrangler.toml` local ou utilize `--var`/`--binding` conforme necessário.

### Desenvolvimento com servidor Node (opcional)
```bash
npm run dev:node
```

Esse modo continua disponível apenas para testes locais básicos e usa o servidor Node da Hono.

### Deploy no Cloudflare Workers
```bash
npm run deploy
```

> Certifique-se de executar `npx wrangler login` antes do deploy e de configurar as variáveis de ambiente via `wrangler.toml` ou `wrangler secret put`.

## Endpoints

### Health Check
```
GET /health
```

Retorna o status do gateway e lista de serviços configurados.

### Proxy de Serviços

O gateway automaticamente roteia requisições baseado na configuração:

- `GET /api/users/123` → `http://localhost:3001/api/users/123`
- `POST /api/products` → `http://localhost:3002/api/products`

## Variáveis de Ambiente

```bash
PORT=3000                           # Porta do gateway
CORS_ORIGINS=http://localhost:3000  # Origens permitidas para CORS
LOG_LEVEL=info                      # Nível de log
```

## Códigos de Resposta

- `200-299`: Sucesso (proxy do serviço)
- `404`: Rota não encontrada
- `405`: Método não permitido
- `503`: Serviço indisponível
- `504`: Timeout de requisição
