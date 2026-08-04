# API de Produtos — Consulta e Estoque

Endpoints para consulta de produtos e saldo de estoque, integrados com as tabelas `TGFPRO` e `TGFEST` do Sankhya via `DbExplorerSP.executeQuery`.

**Autenticação:** todos os endpoints exigem `Authorization: Bearer {JWT}`.

---

## 1. Buscar Produtos

Busca produtos por código ou descrição (LIKE).

### `GET /api/produtos?q={termo}&limite={n}`

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `q` | string | Sim | Termo de busca (1+ caractere). Compara contra `CODPROD` e `DESCRPROD` |
| `limite` | number | Não | Máximo de resultados (padrão 50, máximo 200) |

**Response 200:**
```json
{
  "records": [
    {
      "codProd": "11321",
      "descrProd": "TEAM B CIBAU ADULT MAXI........20KG",
      "codVol": "SC",
      "referencia": "7896181214717",
      "codBarra": null,
      "marca": null,
      "ativo": "S"
    }
  ],
  "total": 1
}
```

**Erros:**
| Status | Condição |
|---|---|
| 400 | Parâmetro `q` vazio ou ausente |
| 401 | Token não fornecido ou inválido |
| 500 | Erro no Sankhya (DbExplorerSP) |

**SQL executado:**
```sql
SELECT PRO.CODPROD, PRO.DESCRPROD, PRO.CODVOL, PRO.REFERENCIA, PRO.ATIVO
FROM TGFPRO PRO
WHERE (UPPER(PRO.DESCRPROD) LIKE UPPER('%{termo}%')
    OR UPPER(PRO.CODPROD) LIKE UPPER('%{termo}%'))
    AND ROWNUM <= {limite}
ORDER BY PRO.DESCRPROD
```

---

## 2. Consultar Estoque

Consulta o saldo de estoque de um produto, agrupado por empresa, local e lote (controle).

### `GET /api/produtos/estoque/{codProd}`

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `codProd` | string (path) | Código do produto |

**Response 200:**
```json
{
  "codProd": "11321",
  "records": [
    {
      "codEmp": 4,
      "codLocal": 302,
      "local": "MELODIA/BR SERVIÇOS",
      "lote": "505635315",
      "estoque": 18.00,
      "dtFabricacao": "24022025 00:00:00",
      "dtValidade": "27082026 00:00:00"
    }
  ],
  "total": 1
}
```

**Campos da resposta:**
| Campo | Tipo | Descrição |
|---|---|---|
| `codEmp` | number | Código da empresa |
| `codLocal` | number | Código do local de estoque |
| `local` | string | Descrição do local (TGFLOC) |
| `lote` | string \| null | Número do lote (coluna `CONTROLE` da TGFEST) |
| `estoque` | number | Saldo atual |
| `dtFabricacao` | string \| null | Data de fabricação (formato Sankhya: `DDMMYYYY HH:MM:SS`) |
| `dtValidade` | string \| null | Data de validade (formato Sankhya: `DDMMYYYY HH:MM:SS`) |

> Apenas linhas com `ESTOQUE <> 0` são retornadas.

**SQL executado:**
```sql
SELECT
    EST.CODEMP,
    EST.CODLOCAL,
    LOC.DESCRLOCAL AS LOCAL,
    EST.CONTROLE,
    EST.ESTOQUE,
    EST.DTFABRICACAO,
    EST.DTVAL
FROM TGFEST EST
LEFT JOIN TGFLOC LOC ON LOC.CODLOCAL = EST.CODLOCAL
WHERE EST.CODPROD = {codProd}
    AND EST.ESTOQUE <> 0
ORDER BY EST.CODEMP, EST.CODLOCAL, EST.CONTROLE
```

---

## Tabelas Sankhya Envolvidas

| Tabela | Uso |
|---|---|
| `TGFPRO` | Cadastro de produtos (código, descrição, referência, unidade) |
| `TGFEST` | Saldos de estoque por empresa/local/controle, com datas de fabricação e validade |
| `TGFLOC` | Descrição dos locais de estoque |

---

## Decisões de Design

| Decisão | Justificativa |
|---|---|
| `DbExplorerSP` (SQL) em vez de `CRUDServiceProvider` | Permite LIKE flexível em múltiplas colunas com um único service call |
| `ROWNUM <= limite` | Evita payloads gigantes em buscas muito abertas |
| Escape de aspas simples no termo (`'` → `''`) | Prevenção de injeção SQL (DbExplorerSP interpola o SQL como string) |
| Lote = coluna `CONTROLE` | No Sankhya, o controle de estoque identifica o lote/serial do produto |
| Datas no formato Sankhya (`DDMMYYYY`) | O frontend formata para `DD/MM/YYYY` na exibição |
| `codBarra` e `marca` sempre `null` | A TGFPRO não tem essas colunas diretamente; TGFBAR tem código de barras mas exigiria JOIN extra |
