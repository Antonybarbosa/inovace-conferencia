# API de Autenticação

Documentação dos endpoints de autenticação do BFF.

---

## Endpoints

| Método | Rota | Descrição | Protegida |
|---|---|---|---|
| POST | `/auth/login` | Login interno (dev/teste) | Não |
| POST | `/auth/sankhya-login` | Login via usuário Sankhya | Não |
| POST | `/auth/logout` | Logout | Não |
| GET | `/auth/me` | Dados da sessão atual | Sim |

---

## Login Sankhya (produção)

Autentica um usuário do ERP Sankhya via `MobileLoginSP.login` e retorna JWT + código do usuário.

**Endpoint:** `POST /auth/sankhya-login`

**Request:**
```json
{
  "usuario": "VICTOR.D",
  "senha": "123456"
}
```

**Response (sucesso):**
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "codUsu": 325,
    "nomeUsu": "VICTOR.D",
    "jsessionid": "cjct10SN-lRlLgAAb824..."
  }
}
```

**Campos da resposta:**
| Campo | Tipo | Descrição |
|---|---|---|
| `token` | string | JWT válido por 24h para autenticar nas demais rotas |
| `user.codUsu` | number | Código do usuário no Sankhya (CODUSU) |
| `user.nomeUsu` | string | Nome de login do usuário |
| `user.jsessionid` | string | Sessão no Sankhya (uso interno) |

**Uso no frontend:**
1. Conferente faz login com suas credenciais do Sankhya
2. Guarda `token` no localStorage para autenticar chamadas
3. Guarda `codUsu` para enviar nas transações (ex: `CODUSUCONF` ao iniciar conferência)
4. JWT expira em 24h — renovar com novo login

---

## Login Interno (dev/teste)

Login simplificado para desenvolvimento. Aceita qualquer usuário/senha.

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "username": "testuser",
  "password": "testpass"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "1",
    "username": "testuser",
    "email": "testuser@example.com"
  }
}
```

> Em produção, substituir `InMemoryAuthAdapter` por validação real.

---

## Validar Sessão

Retorna dados do usuário logado a partir do JWT.

**Endpoint:** `GET /auth/me`
**Header:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "userId": "325",
    "username": "VICTOR.D",
    "email": "VICTOR.D@sankhya.local"
  }
}
```

---

## Serviço Sankhya utilizado

**Serviço:** `MobileLoginSP.login`
**Endpoint Gateway:** `POST /gateway/v1/mge/service.sbr?serviceName=MobileLoginSP.login&outputType=json`

**Body enviado:**
```json
{
  "serviceName": "MobileLoginSP.login",
  "requestBody": {
    "NOMUSU": { "$": "VICTOR.D" },
    "INTERNO": { "$": "123456" }
  }
}
```

**Resposta do Gateway:**
```json
{
  "responseBody": {
    "callID": { "$": "072EEBFB0EC8AB9038F1ED92C5E2D771" },
    "jsessionid": { "$": "GggGuS5jwvxsyZa9waOP7TAiLFni1aImQvs6W2Qf" },
    "idusu": { "$": "MzI1\n" }
  }
}
```

> `idusu` está em Base64. Decodificar: `MzI1` → `325` (CODUSU).

---

## Notas técnicas

- O `MobileLoginSP.login` usa o endpoint `/mge/` (não `/mgecom/`)
- A senha é a **senha interna** do Sankhya (não a do Sankhya ID)
- O JWT gerado pelo BFF contém `userId = codUsu` — usar em `req.userId` nas rotas protegidas
