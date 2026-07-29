# Backend BFF - Sankhya

Backend for Frontend (BFF) para integração com Gateway Sankhya. Implementa autenticação OAuth, gerenciamento de tokens e proxy seguro para APIs REST do ERP Sankhya.

## Arquitetura

```
React SPA (localhost:5173)
    ↓
Backend BFF (localhost:3001)
    ├─ /auth (Login, Logout, Validação)
    └─ /api (Proxy para Gateway)
         ↓
    Gateway Sankhya (Homologação)
         ↓
    ERP Sankhya
```

## Características

- ✅ Autenticação OAuth 2.0 Client Credentials com Gateway Sankhya
- ✅ Gerenciamento de tokens com cache e refresh automático
- ✅ Middleware de autenticação e autorização
- ✅ Correlation ID para rastreabilidade
- ✅ Logging estruturado e observabilidade
- ✅ Tratamento de erros centralizado
- ✅ CORS configurável
- ✅ TypeScript com tipos completos

## Requisitos

- Node.js 18+
- npm 9+
- Credenciais do Gateway Sankhya (homologação)

## Instalação

```bash
# Clonar/copiar arquivos
cd backend

# Instalar dependências
npm install

# Copiar arquivo de exemplo
cp .env.example .env

# Configurar variáveis de ambiente
# Editar .env com suas credenciais
```

## Configuração

Editar `.env` com as credenciais do Gateway Sankhya:

```env
GATEWAY_URL=https://gateway-homolog.sankhya.com.br
GATEWAY_CLIENT_ID=seu_client_id
GATEWAY_CLIENT_SECRET=seu_client_secret
GATEWAY_X_TOKEN=seu_x_token
SESSION_SECRET=sua_chave_secreta_minimo_32_caracteres
CORS_ORIGIN=http://localhost:5173
```

## Desenvolvimento

```bash
# Iniciar servidor em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar versão compilada
npm start
```

O servidor estará disponível em `http://localhost:3001`.

## API Endpoints

### Autenticação

```bash
# Login
POST /auth/login
Content-Type: application/json

{
  "username": "user",
  "password": "password"
}

# Resposta
{
  "token": "eyJhbGc...",
  "user": {
    "id": "1",
    "username": "user",
    "email": "user@example.com"
  }
}
```

```bash
# Validar sessão
GET /auth/me
Authorization: Bearer eyJhbGc...
```

```bash
# Logout
POST /auth/logout
Authorization: Bearer eyJhbGc...
```

### Produtos

```bash
# Listar produtos
GET /api/produtos
Authorization: Bearer eyJhbGc...

# Buscar produto por ID
GET /api/produtos/:id
Authorization: Bearer eyJhbGc...
```

### Clientes

```bash
# Listar clientes
GET /api/parceiros/clientes
Authorization: Bearer eyJhbGc...
```

### Pedidos

```bash
# Listar pedidos
GET /api/vendas/pedidos
Authorization: Bearer eyJhbGc...

# Buscar pedido por ID
GET /api/vendas/pedidos/:id
Authorization: Bearer eyJhbGc...

# Criar pedido
POST /api/vendas/pedidos
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{ "cliente_id": "1", "items": [...] }

# Atualizar pedido
PUT /api/vendas/pedidos/:id
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{ "status": "aprovado" }
```

### Financeiro

```bash
# Listar receitas
GET /api/financeiros/receitas
Authorization: Bearer eyJhbGc...
```

### Health Check

```bash
GET /health

# Resposta
{
  "status": "ok",
  "timestamp": "2026-07-24T17:06:14.990Z",
  "correlationId": "uuid"
}
```

## Estrutura do Projeto

```
backend/
├── src/
│   ├── config.ts           # Configuração de variáveis de ambiente
│   ├── index.ts            # Ponto de entrada da aplicação
│   ├── middleware.ts       # Middlewares (CORS, auth, logging, etc)
│   ├── services/
│   │   ├── gatewayService.ts    # Comunicação com Gateway Sankhya
│   │   └── sessionService.ts    # Gerenciamento de tokens de sessão
│   └── routes/
│       ├── auth.ts        # Rotas de autenticação
│       └── api.ts         # Rotas proxy para APIs Sankhya
├── dist/                   # Código compilado
├── .env.example           # Exemplo de variáveis de ambiente
├── package.json           # Dependências
├── tsconfig.json          # Configuração TypeScript
└── README.md
```

## Fluxo de Autenticação

1. Cliente React faz login com username/password
2. BFF valida credenciais (implementar contra BD)
3. BFF gera JWT de sessão válido por 24h
4. JWT é armazenado no localStorage do navegador
5. Cada requisição à API inclui o JWT no header `Authorization: Bearer <token>`
6. BFF valida o JWT e faz a requisição ao Gateway com suas próprias credenciais
7. Gateway retorna dados ao BFF, que repassa ao React
8. Se token expirar, React faz logout e redireciona para login

## Gerenciamento de Tokens

### Token de Sessão (React)
- Gerado pelo BFF após login
- Válido por 24 horas
- Armazenado no localStorage
- Validado em cada requisição ao BFF

### Token do Gateway (Servidor)
- Obtido via OAuth 2.0 Client Credentials
- Válido por X minutos (conforme configurado no Gateway)
- Armazenado em memória no BFF
- Renovado automaticamente quando expira
- Nunca é exposto ao cliente

## Observabilidade

### Logging

Cada requisição gera um log estruturado:

```json
{
  "timestamp": "2026-07-24T17:06:14.990Z",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "GET",
  "endpoint": "/api/produtos",
  "statusCode": 200,
  "duration": "145ms",
  "userId": "1"
}
```

### Correlation ID

- Identificador único por requisição
- Passado através de todas as camadas (React → BFF → Gateway → ERP)
- Rastreia todo o ciclo de uma requisição
- Gerado automaticamente se não fornecido
- Retornado nos headers da resposta

## Segurança

### Princípios

- ✅ Credenciais do Gateway nunca são expostas ao navegador
- ✅ Tokens de sessão validados em cada requisição
- ✅ HTTPS obrigatório em produção
- ✅ CORS configurado apenas para domínios confiáveis
- ✅ Tratamento de erros sem expor detalhes sensíveis

### Boas Práticas

1. **Variáveis de Ambiente**: Nunca commit `.env` no git
2. **Tokens**: Armazenar com segurança (HttpOnly cookies em produção)
3. **HTTPS**: Obrigatório em produção
4. **Validação**: Sempre validar entrada do cliente
5. **Logs**: Não registrar tokens ou dados sensíveis

## Tratamento de Erros

| Status | Significado |
|--------|------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido/expirado |
| 404 | Not Found - Recurso não existe |
| 500 | Server Error - Erro interno |

## Próximos Passos

- [ ] Implementar autenticação contra banco de dados
- [ ] Adicionar validação de entrada com Zod ou Joi
- [ ] Implementar rate limiting
- [ ] Adicionar testes unitários e integração
- [ ] Implementar refresh token
- [ ] Adicionar suporte a múltiplos ambientes
- [ ] Implementar cache com Redis
- [ ] Adicionar webhooks do Gateway
- [ ] Documentação com Swagger/OpenAPI

## Suporte

Para dúvidas ou problemas, consulte:
- Documentação do Gateway Sankhya
- Issues no repositório do projeto
