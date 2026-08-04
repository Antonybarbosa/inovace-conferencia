# Arquitetura do Backend BFF Sankhya

## Visão Geral

O projeto segue **Clean Architecture** (Ports & Adapters), com 4 camadas concêntricas onde dependências apontam sempre para o centro.

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION (HTTP)                        │
│  Controllers · Middlewares · Routes · Express Server          │
├─────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE                             │
│  SankhyaGatewayAdapter · JwtTokenAdapter · InMemoryAuth      │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION                                │
│  Use Cases · DTOs · Helpers                                  │
├─────────────────────────────────────────────────────────────┤
│                    DOMAIN (centro)                            │
│  Entities · Ports (interfaces) · Value Objects               │
└─────────────────────────────────────────────────────────────┘
```

**Regra de dependência:** cada camada só pode importar da camada imediatamente abaixo (ou do domínio). Nunca para cima.

---

## Estrutura de Pastas

```
src/
├── domain/                              # Camada de Domínio
│   ├── entities/
│   │   ├── User.ts
│   │   └── CrudRecord.ts
│   ├── ports/
│   │   ├── IGatewayPort.ts              # Interface: Gateway Sankhya (mge + mgecom)
│   │   ├── ITokenPort.ts               # Interface: gerenciamento JWT
│   │   └── IAuthPort.ts                # Interface: validação de credenciais
│   └── value-objects/
│       ├── CorrelationId.ts
│       └── Token.ts
│
├── application/                         # Camada de Aplicação
│   ├── use-cases/
│   │   ├── auth/
│   │   │   ├── LoginUseCase.ts
│   │   │   ├── LoginSankhyaUseCase.ts
│   │   │   ├── LogoutUseCase.ts
│   │   │   └── ValidateSessionUseCase.ts
│   │   ├── crud/
│   │   │   ├── LoadRecordsUseCase.ts
│   │   │   ├── LoadRecordUseCase.ts
│   │   │   ├── SaveRecordUseCase.ts
│   │   │   ├── RemoveRecordUseCase.ts
│   │   │   └── LoadViewUseCase.ts
│   │   ├── conferencias/
│   │   │   ├── consulta/               # Leitura / busca de dados
│   │   │   │   ├── GetConferenciaSaidaUseCase.ts
│   │   │   │   ├── ListarItensPedidoUseCase.ts
│   │   │   │   ├── ListarItensConferidosUseCase.ts
│   │   │   │   ├── GetProdutoUseCase.ts
│   │   │   │   ├── GetProdutosDivergentesUseCase.ts
│   │   │   │   └── VerificarExcluidosUseCase.ts
│   │   │   ├── operacao/               # Escrita durante conferência
│   │   │   │   ├── SalvarItemConferidoUseCase.ts
│   │   │   │   └── SalvarVolumeUseCase.ts
│   │   │   ├── ciclo-vida/             # Controle do ciclo da conferência
│   │   │   │   ├── IniciarConferenciaUseCase.ts
│   │   │   │   ├── ExcluirConferenciaUseCase.ts
│   │   │   │   ├── FinalizarConferenciaUseCase.ts
│   │   │   │   └── CortarNotaUseCase.ts
│   │   │   └── shared/
│   │   │       └── clientEvents.ts     # clientEventList padrão
│   │   ├── produtos/
│   │   │   ├── ConsultarProdutosUseCase.ts   # Busca por termo (TGFPRO)
│   │   │   └── ConsultarEstoqueUseCase.ts    # Saldo por empresa/local/lote (TGFEST)
│   │   └── proxy/
│   │       └── GatewayProxyUseCase.ts
│   ├── dtos/
│   │   ├── AuthDTOs.ts
│   │   └── CrudDTOs.ts
│   └── helpers/
│       └── sankhyaParser.ts            # Parse de respostas f0/f1 → objetos
│
├── infrastructure/                      # Camada de Infraestrutura
│   ├── gateway/
│   │   └── SankhyaGatewayAdapter.ts    # Implementa IGatewayPort (mge + mgecom)
│   ├── auth/
│   │   ├── JwtTokenAdapter.ts
│   │   └── InMemoryAuthAdapter.ts
│   └── config/
│       └── env.ts
│
├── presentation/                        # Camada de Apresentação
│   ├── http/
│   │   ├── controllers/
│   │   │   ├── AuthController.ts
│   │   │   ├── CrudController.ts
│   │   │   ├── ApiProxyController.ts
│   │   │   ├── ConferenciasController.ts
│   │   │   └── ProdutoController.ts
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.ts
│   │   │   ├── correlationId.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── requestLogger.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── crudRoutes.ts
│   │   │   ├── apiRoutes.ts
│   │   │   ├── conferenciasRoutes.ts
│   │   │   ├── produtoRoutes.ts
│   │   │   └── index.ts
│   │   └── types.ts
│   └── server.ts
│
├── container.ts                         # Composition Root (DI manual)
└── main.ts                              # Entry point
```

---

## Endpoints da API

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Login interno (retorna JWT) |
| POST | `/auth/sankhya-login` | Login via usuário Sankhya (MobileLoginSP) |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Dados da sessão |

### CRUD Genérico (CRUDServiceProvider)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/crud/list/:entity` | Listar registros |
| POST | `/api/crud/load/:entity` | Carregar registro único |
| POST | `/api/crud/save/:entity` | Criar/atualizar registro |
| POST | `/api/crud/delete/:entity` | Remover registro |
| POST | `/api/crud/view/:viewName` | Consulta em views |
| GET | `/api/crud/entities` | Lista entidades disponíveis |

### Conferências (ConferenciaSP)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/conferencias` | Lista pedidos pendentes |
| POST | `/api/conferencias/verificar-excluidos` | Verifica se nota tem apenas excluídos |
| POST | `/api/conferencias/iniciar` | Inicia conferência |
| POST | `/api/conferencias/excluir` | Exclui/cancela conferência |
| POST | `/api/conferencias/itens-pedido` | Lista itens (com descrição e código de barras) |
| POST | `/api/conferencias/itens-conferidos` | Lista itens já conferidos |
| POST | `/api/conferencias/produto` | Busca produto por código de barras |
| POST | `/api/conferencias/conferir-item` | Confere um item |
| POST | `/api/conferencias/divergentes` | Lista produtos divergentes |
| POST | `/api/conferencias/volume` | Registra volume |
| POST | `/api/conferencias/finalizar` | Finaliza conferência |
| POST | `/api/conferencias/cortar` | Corta nota por divergência |

### API Proxy (REST genérico)
| Method | Route | Description |
|---|---|---|
| GET | `/api/produtos` | Proxy para produtos |
| GET | `/api/parceiros/clientes` | Proxy para clientes |
| GET/POST/PUT | `/api/vendas/pedidos` | Proxy para pedidos |

### Produtos
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/produtos?q={termo}&limite={n}` | Busca produtos por código ou descrição (TGFPRO) |
| GET | `/api/produtos/estoque/{codProd}` | Consulta saldo de estoque por empresa, local e lote (TGFEST) |

### Utilitário
| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Health check |

---

## Endpoints do Gateway Sankhya

| Módulo | Endpoint | Serviços |
|---|---|---|
| MGE | `/gateway/v1/mge/service.sbr` | CRUDServiceProvider, DbExplorerSP |
| MGECOM | `/gateway/v1/mgecom/service.sbr` | ConferenciaSP |

O `SankhyaGatewayAdapter.serviceCall()` aceita o parâmetro `module: 'mge' | 'mgecom'` para rotear.

---

## Injeção de Dependências

Composição manual no `container.ts`:

```
Config → Adapters → Use Cases → Controllers → Server
```

---

## Decisões de Design

| Decisão | Justificativa |
|---------|---------------|
| DI manual (sem framework) | Simplicidade, zero deps extras |
| Use Cases por operação | Independentes, testáveis, responsabilidade única |
| Subpastas por responsabilidade | consulta/operacao/ciclo-vida — fácil de navegar |
| Ports como interfaces | Trocar implementações sem alterar regras de negócio |
| serviceCall com module | Abstrai diferença mge vs mgecom |
| clientEventList compartilhado | DRY — um único arquivo shared |
| Enriquecimento via SQL | listarItensPedido busca desc/barras automaticamente |

---

## Stack Tecnológica

- **Runtime:** Node.js 18+
- **Linguagem:** TypeScript 5.x (strict mode)
- **Framework HTTP:** Express 4.18
- **HTTP Client:** Axios
- **Auth:** jsonwebtoken (JWT HS256)
- **Observabilidade:** Morgan + logs estruturados + Correlation ID
- **Build:** tsc (ES2020 modules)

---

## Comandos

```bash
npm run dev       # Desenvolvimento (ts-node ESM)
npm run build     # Build (tsc)
npm start         # Produção (node dist/main.js)
```
