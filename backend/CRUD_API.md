# API CRUD — Formato Oficial CRUDServiceProvider Sankhya

Referência: https://developer.sankhya.com.br/reference/get_loadrecords

---

## Endpoint do Gateway

```
POST https://api.sandbox.sankhya.com.br/gateway/v1/mge/service.sbr
     ?serviceName=CRUDServiceProvider.{operação}&outputType=json
```

Operações disponíveis: `loadRecords`, `loadRecord`, `saveRecord`, `removeRecord`

---

## Endpoints do BFF (nosso backend)

| Operação | Método | URL | Descrição |
|---|---|---|---|
| Listar registros | POST | `/api/crud/list/:entity` | Consulta múltiplos registros |
| Carregar um registro | POST | `/api/crud/load/:entity` | Busca por chave primária |
| Salvar registro | POST | `/api/crud/save/:entity` | Criar ou atualizar |
| Remover registro | POST | `/api/crud/delete/:entity` | Deletar por chave primária |
| Carregar view | POST | `/api/crud/view/:viewName` | Consulta em views |
| Listar entidades | GET | `/api/crud/entities` | Referência de nomes |

Todos exigem `Authorization: Bearer <token>` no header.

---

## loadRecords — Listar registros

```http
POST /api/crud/list/CabecalhoNota
Authorization: Bearer <token>
Content-Type: application/json
```

### Body:

```json
{
  "entity": [
    {
      "path": "",
      "fieldset": { "list": "NUNOTA, NUMNOTA, DTNEG, CODPARC, VLRNOTA" }
    },
    {
      "path": "Parceiro",
      "fieldset": { "list": "NOMEPARC, CGC_CPF" }
    }
  ],
  "criteria": {
    "expression": { "$": "CODPARC = ?" },
    "parameter": [
      { "$": "720", "type": "I" }
    ]
  },
  "offsetPage": 0,
  "includePresentationFields": "N"
}
```

### Campos do body:

| Campo | Obrigatório | Descrição |
|---|---|---|
| `entity` | Sim | Array de paths + campos. `path: ""` = entidade raiz |
| `entity[].path` | Sim | `""` para raiz, ou nome da entidade relacionada (JOIN) |
| `entity[].fieldset.list` | Sim | Campos separados por vírgula |
| `criteria` | Não | Filtro WHERE |
| `criteria.expression.$` | - | Expressão SQL com `?` para parâmetros |
| `criteria.parameter[]` | - | Valores na ordem dos `?` |
| `criteria.parameter[].type` | - | `I`=inteiro, `S`=string, `F`=float, `H`=data |
| `offsetPage` | Sim | Página (começa em 0) |
| `includePresentationFields` | Não | `S` ou `N` (default: N) |
| `orderBy` | Não | Campo para ordenação |

### Resposta:

```json
{
  "records": [
    {
      "NUNOTA": "2346",
      "NUMNOTA": "168",
      "DTNEG": "14/12/2012",
      "CODPARC": "1472",
      "VLRNOTA": "186.82",
      "Parceiro_NOMEPARC": "SHOP RURAL AGROVETERINARIA",
      "Parceiro_CGC_CPF": "15808508000198"
    }
  ],
  "total": 50,
  "hasMoreResult": true,
  "offsetPage": 0,
  "metadata": [
    { "name": "NUNOTA" },
    { "name": "NUMNOTA" },
    { "name": "Parceiro_NOMEPARC" }
  ]
}
```

> Campos de entidades relacionadas vêm com prefixo: `Parceiro_NOMEPARC`, `Cidade_NOMECID`

---

## loadRecord — Buscar registro único

```http
POST /api/crud/load/Produto
Authorization: Bearer <token>
Content-Type: application/json
```

### Body:

```json
{
  "entity": [
    { "path": "", "fieldset": { "list": "CODPROD, DESCRPROD" } },
    { "path": "GrupoProduto", "fieldset": { "list": "CODGRUPOPROD, DESCRGRUPOPROD" } }
  ],
  "primaryKey": {
    "CODPROD": { "$": "4" }
  }
}
```

### Resposta:

```json
{
  "record": {
    "CODPROD": "4",
    "DESCRPROD": "MINI BEAUTY.....................1KG"
  }
}
```

---

## saveRecord — Criar ou atualizar (CRUDServiceProvider)

> **ATENÇÃO:** O `CRUDServiceProvider.saveRecord` pode não funcionar para UPDATE em algumas entidades.
> Para atualizações, use `DatasetSP.save` (ver seção abaixo).

```http
POST /api/crud/save/Parceiro
Authorization: Bearer <token>
Content-Type: application/json
```

### Body:

```json
{
  "data": {
    "NOMEPARC": { "$": "Novo Parceiro LTDA" },
    "CGC_CPF": { "$": "12345678000100" },
    "TIPPESSOA": { "$": "J" },
    "CLIENTE": { "$": "S" }
  }
}
```

### Resposta:

```json
{
  "success": true,
  "record": {
    "CODPARC": "9999",
    "NOMEPARC": "Novo Parceiro LTDA"
  }
}
```

---

## removeRecord — Deletar registro

```http
POST /api/crud/delete/Parceiro
Authorization: Bearer <token>
Content-Type: application/json
```

### Body:

```json
{
  "primaryKey": {
    "CODPARC": { "$": "9999" }
  }
}
```

### Resposta:

```json
{
  "success": true
}
```

---

## JOINs (Entidades Relacionadas)

Para trazer dados de entidades ligadas, adicione itens ao array `entity` com o `path` da entidade:

```json
{
  "entity": [
    { "path": "", "fieldset": { "list": "NUNOTA, NUMNOTA, CODPARC" } },
    { "path": "Parceiro", "fieldset": { "list": "NOMEPARC, CGC_CPF" } },
    { "path": "Parceiro.Cidade", "fieldset": { "list": "NOMECID, UF" } }
  ]
}
```

Os campos retornados terão prefixo: `Parceiro_NOMEPARC`, `Parceiro.Cidade_NOMECID`.

---

## Paginação

- `offsetPage: 0` = primeira página (50 registros por padrão)
- Se `hasMoreResult: true` na resposta, incrementar `offsetPage` para próxima página
- Repetir até `hasMoreResult: false`

```javascript
let page = 0;
let hasMore = true;

while (hasMore) {
  const result = await fetch('/api/crud/list/Parceiro', {
    body: { entity: [...], offsetPage: page }
  });
  hasMore = result.hasMoreResult;
  page++;
}
```

---

## Critérios (Filtros)

### Filtro simples:
```json
{
  "criteria": {
    "expression": { "$": "ATIVO = ?" },
    "parameter": [{ "$": "S", "type": "S" }]
  }
}
```

### Múltiplos parâmetros:
```json
{
  "criteria": {
    "expression": { "$": "CODPROD IN (?, ?) AND DESCRPROD LIKE '%?%'" },
    "parameter": [
      { "$": "1", "type": "I" },
      { "$": "2", "type": "I" },
      { "$": "QUEIJO", "type": "S" }
    ]
  }
}
```

### Tipos de parâmetro:

| Tipo | Significado | Exemplo |
|---|---|---|
| `I` | Inteiro | `"$": "123"` |
| `S` | String | `"$": "texto"` |
| `F` | Float/Decimal | `"$": "99.90"` |
| `H` | Data | `"$": "01/01/2026"` |

---

## Entidades Comuns

| Entidade | Tabela | Chave Primária |
|---|---|---|
| CabecalhoNota | TGFCAB | NUNOTA |
| ItemNota | TGFITE | NUNOTA + SEQUENCIA |
| Parceiro | TGFPAR | CODPARC |
| Produto | TGFPRO | CODPROD |
| Conferencia | - | NUCONFERENCIA |
| OrdemCarga | - | NUORDEMCARGA |
| Rota | - | CODROTA |
| RotaParceiro | - | CODPARC + CODROTA |

---

## Exemplos Completos

### Notas com parceiro e cidade:
```json
POST /api/crud/list/CabecalhoNota

{
  "entity": [
    { "path": "", "fieldset": { "list": "NUNOTA, NUMNOTA, DTNEG, VLRNOTA, STATUSNOTA" } },
    { "path": "Parceiro", "fieldset": { "list": "NOMEPARC, CGC_CPF" } },
    { "path": "Parceiro.Cidade", "fieldset": { "list": "NOMECID, UF" } }
  ],
  "criteria": {
    "expression": { "$": "DTNEG >= ?" },
    "parameter": [{ "$": "01/01/2012", "type": "S" }]
  },
  "offsetPage": 0
}
```

### Itens de uma nota específica:
```json
POST /api/crud/list/ItemNota

{
  "entity": [
    { "path": "", "fieldset": { "list": "NUNOTA, SEQUENCIA, CODPROD, QTDNEG, VLRUNIT, VLRTOT" } },
    { "path": "Produto", "fieldset": { "list": "DESCRPROD" } }
  ],
  "criteria": {
    "expression": { "$": "NUNOTA = ?" },
    "parameter": [{ "$": "2346", "type": "I" }]
  },
  "offsetPage": 0
}
```

### Parceiros clientes com endereço:
```json
POST /api/crud/list/Parceiro

{
  "entity": [
    { "path": "", "fieldset": { "list": "CODPARC, NOMEPARC, CGC_CPF, CEP" } },
    { "path": "Endereco", "fieldset": { "list": "NOMEEND" } },
    { "path": "Bairro", "fieldset": { "list": "NOMEBAI" } },
    { "path": "Cidade", "fieldset": { "list": "NOMECID, UF" } }
  ],
  "criteria": {
    "expression": { "$": "CLIENTE = ?" },
    "parameter": [{ "$": "S", "type": "S" }]
  },
  "offsetPage": 0
}
```


---

## DatasetSP.save — Atualizar campos de uma entidade (RECOMENDADO para UPDATE)

O `DatasetSP.save` é o serviço correto para **atualizar registros** existentes no Sankhya.
Diferente do `CRUDServiceProvider.saveRecord` (que pode falhar silenciosamente), o `DatasetSP.save` funciona de forma confiável.

**Endpoint Gateway:**
```
POST /gateway/v1/mge/service.sbr?serviceName=DatasetSP.save&outputType=json
```

### Estrutura do body:

```json
{
  "serviceName": "DatasetSP.save",
  "requestBody": {
    "entityName": "CabecalhoNota",
    "standAlone": false,
    "fields": ["CAMPO1", "CAMPO2"],
    "records": [
      {
        "pk": {
          "CHAVE_PRIMARIA": valor
        },
        "values": {
          "0": "valor_campo1",
          "1": "valor_campo2"
        }
      }
    ]
  }
}
```

### Campos do body:

| Campo | Obrigatório | Descrição |
|---|---|---|
| `entityName` | Sim | Nome da **entidade** (não da tabela). Ex: `CabecalhoNota`, `ItemNota`, `Parceiro` |
| `standAlone` | Sim | `false` para operações normais |
| `fields` | Sim | Array com nomes dos campos a atualizar (na ordem) |
| `records` | Sim | Array de registros a atualizar |
| `records[].pk` | Sim | Chave primária do registro (campos PK com valores) |
| `records[].values` | Sim | Valores a gravar. Keys são índices (string) correspondendo à posição no array `fields` |

### Mapeamento fields → values:

Os `values` usam índices baseados na posição do array `fields`:
- `fields[0]` → `values["0"]`
- `fields[1]` → `values["1"]`
- `fields[2]` → `values["2"]`

### Response (sucesso):
```json
{
  "serviceName": "DatasetSP.save",
  "status": "1",
  "responseBody": {
    "total": "1",
    "result": [["VICTOR.D"]]
  }
}
```

---

### Exemplos práticos:

#### Atualizar campo AD_USUARIOCONF no CabecalhoNota:
```json
{
  "serviceName": "DatasetSP.save",
  "requestBody": {
    "entityName": "CabecalhoNota",
    "standAlone": false,
    "fields": ["AD_USUARIOCONF"],
    "records": [{
      "pk": { "NUNOTA": 1339393 },
      "values": { "0": "VICTOR.D" }
    }]
  }
}
```

#### Atualizar CONTROLE (lote) no ItemNota:
```json
{
  "serviceName": "DatasetSP.save",
  "requestBody": {
    "entityName": "ItemNota",
    "standAlone": false,
    "fields": ["CONTROLE"],
    "records": [{
      "pk": {
        "NUNOTA": 1349562,
        "SEQUENCIA": 1
      },
      "values": { "0": "LOTE-2026-A" }
    }]
  }
}
```

#### Atualizar múltiplos campos de uma vez:
```json
{
  "serviceName": "DatasetSP.save",
  "requestBody": {
    "entityName": "CabecalhoNota",
    "standAlone": false,
    "fields": ["AD_USUARIOCONF", "OBSERVACAO"],
    "records": [{
      "pk": { "NUNOTA": 1339393 },
      "values": {
        "0": "VICTOR.D",
        "1": "Conferencia iniciada via app"
      }
    }]
  }
}
```

#### Atualizar múltiplos registros de uma vez:
```json
{
  "serviceName": "DatasetSP.save",
  "requestBody": {
    "entityName": "CabecalhoNota",
    "standAlone": false,
    "fields": ["AD_USUARIOCONF"],
    "records": [
      { "pk": { "NUNOTA": 1339393 }, "values": { "0": "VICTOR.D" } },
      { "pk": { "NUNOTA": 1349562 }, "values": { "0": "VICTOR.D" } },
      { "pk": { "NUNOTA": 1349529 }, "values": { "0": "VICTOR.D" } }
    ]
  }
}
```

---

### Entidades comuns e suas PKs:

| Entidade | PK |
|---|---|
| `CabecalhoNota` | `NUNOTA` |
| `ItemNota` | `NUNOTA` + `SEQUENCIA` |
| `Parceiro` | `CODPARC` |
| `Produto` | `CODPROD` |

---

### Quando usar cada serviço:

| Operação | Serviço | Funciona? |
|---|---|---|
| **Consultar** múltiplos registros | `CRUDServiceProvider.loadRecords` | ✅ |
| **Consultar** registro único | `CRUDServiceProvider.loadRecord` | ✅ |
| **Atualizar** campos existentes | `DatasetSP.save` | ✅ (RECOMENDADO) |
| **Inserir** novo registro | `CRUDServiceProvider.saveRecord` | ✅ (para insert) |
| **Deletar** registro | `CRUDServiceProvider.removeRecord` | ✅ |
| **SQL** complexo (leitura) | `DbExplorerSP.executeQuery` | ✅ (apenas SELECT) |
