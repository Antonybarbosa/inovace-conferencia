---
inclusion: auto
---

# Arquitetura do Projeto - Clean Architecture

Este projeto (backend/) segue Clean Architecture com 4 camadas. Ao modificar ou criar código, respeite estas regras:

## Regra de Dependência
- **domain/** → não importa nada de outras camadas
- **application/** → importa apenas de domain/
- **infrastructure/** → importa de domain/ (implementa ports)
- **presentation/** → importa de application/ e domain/
- **container.ts** → único arquivo que importa de TODAS as camadas (composition root)

## Estrutura
```
src/
├── domain/           → Entities, Ports (interfaces), Value Objects
├── application/      → Use Cases + DTOs + Helpers
│   └── use-cases/
│       ├── auth/           → Login, Logout, ValidateSession
│       ├── crud/           → LoadRecords, LoadRecord, SaveRecord, RemoveRecord, LoadView
│       ├── conferencias/
│       │   ├── consulta/   → GetConferenciaSaida, ListarItensPedido, GetProduto, etc.
│       │   ├── operacao/   → SalvarItemConferido, SalvarVolume
│       │   ├── ciclo-vida/ → Iniciar, Excluir, Finalizar, Cortar
│       │   └── shared/     → clientEvents.ts
│       └── proxy/          → GatewayProxyUseCase
├── infrastructure/   → Adapters concretos (Gateway, JWT, Auth)
├── presentation/     → Controllers, Middlewares, Routes (Express)
├── container.ts      → Composition Root (DI manual)
└── main.ts           → Entry point
```

## Ports (interfaces em domain/ports/)
- **IGatewayPort** — comunicação com Gateway Sankhya (mge + mgecom)
  - `serviceCall(serviceName, body, correlationId, module)` — module: 'mge' ou 'mgecom'
- **ITokenPort** — gerar/verificar tokens JWT de sessão
- **IAuthPort** — validar credenciais de usuário

## Convenções ao adicionar funcionalidade
1. Se for regra de negócio → criar Use Case em `application/use-cases/`
2. Se for integração externa → criar Adapter em `infrastructure/` implementando um Port
3. Se for endpoint HTTP → criar/editar Controller em `presentation/http/controllers/` e registrar rota
4. Conectar tudo no `container.ts`
5. Use Cases de conferência vão na subpasta adequada: consulta/, operacao/ ou ciclo-vida/

## Convenções ao adicionar dependência
- Use Cases recebem Ports por construtor (injeção de dependência)
- Controllers recebem Use Cases por construtor
- Middlewares que precisam de infraestrutura usam factory functions
- Nunca instanciar adapters dentro de use cases ou controllers

## Gateway Sankhya — Dois módulos
- `/gateway/v1/mge/service.sbr` → CRUDServiceProvider, DbExplorerSP
- `/gateway/v1/mgecom/service.sbr` → ConferenciaSP (módulo comercial)
- Use Cases de conferência passam `'mgecom'` no serviceCall

## Entry Point & Build
- Dev: `npm run dev` (ts-node com ESM loader)
- Build: `npm run build` (tsc)
- Prod: `npm start` (node dist/main.js)

## API CRUD — Formato CRUDServiceProvider Sankhya

Formato do body para consultas (loadRecords):
```json
{
  "entity": [
    { "path": "", "fieldset": { "list": "CAMPO1, CAMPO2" } },
    { "path": "EntidadeRelacionada", "fieldset": { "list": "CAMPO_JOIN" } }
  ],
  "criteria": {
    "expression": { "$": "CAMPO = ?" },
    "parameter": [{ "$": "valor", "type": "S" }]
  },
  "offsetPage": 0
}
```

Tipos de parâmetro: I=inteiro, S=string, F=float, H=data

Para UPDATE de campos existentes, usar DatasetSP.save (não CRUDServiceProvider.saveRecord):
```json
{
  "serviceName": "DatasetSP.save",
  "requestBody": {
    "entityName": "CabecalhoNota",
    "standAlone": false,
    "fields": ["CAMPO_A_ATUALIZAR"],
    "records": [{ "pk": { "NUNOTA": 123 }, "values": { "0": "valor" } }]
  }
}
```
fields[0] → values["0"], fields[1] → values["1"], etc.

Referência completa de uso: #[[file:backend/CRUD_API.md]]

## Referência de arquitetura
#[[file:backend/ARCHITECTURE.md]]

## Referência da API de Autenticação (Login Sankhya)
#[[file:backend/AUTH_API.md]]

## Referência da API de Conferência (ConferenciaSP)
#[[file:backend/CONFERENCIA_API.md]]
