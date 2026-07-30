# Progresso do Projeto — Conferência de Saída Sankhya

## O que foi construído

### Backend (Clean Architecture)
- **Stack:** Node.js + Express + TypeScript
- **Arquitetura:** Domain → Application → Infrastructure → Presentation
- **Gateway:** Integração completa com API Sankhya (mge + mgecom)
- **Hot reload:** `npm run dev` com `node --watch`

### Frontend (React)
- **Stack:** React 19 + Vite + TypeScript
- **Arquitetura:** domain/application/infrastructure/presentation
- **Visual:** Estilo premium (paleta slate/orange, rounded, sombras)
- **Capacitor:** Configurado para gerar app Android

---

## Funcionalidades Implementadas

### Login
- Login via `MobileLoginSP.login` (credenciais Sankhya)
- JWT gerado pelo backend com codUsu do conferente
- Proteção de rotas no frontend

### Lista de Conferências
- Consulta SQL complexa com JOINs (DbExplorerSP)
- Filtros dinâmicos (auto-detecta campos, dropdown para poucos valores)
- Tags de filtro ativo com remoção individual
- Cards compactos com status colorido (azul=pendente, amarelo=andamento, vermelho=recontagem)
- Duplo clique para abrir conferência

### Tela de Conferência
- Iniciar conferência via `ConferenciaSP.salvarCabecalhoConferencia`
- Scanner: Enter confere direto (sem precisar clicar botão)
- Lista separada: Pendentes (parciais primeiro) + Conferidos (OK primeiro)
- Itens com imagem do produto (via .dbimage do Sankhya)
- Ampliar imagem ao clicar
- Modal de finalização com campo de volumes
- Contadores compactos (Total, Conferidos, Pendentes)
- Suporte a itens duplicados (mesmo CODPROD, lotes diferentes) via SEQUENCIA
- Itens conferidos nunca somem (merge inteligente com dados do Sankhya)

### Escrita no Sankhya
- `DatasetSP.save` para atualizar campos (AD_USUARIOCONF no CabecalhoNota)
- `ConferenciaSP.salvarItemConferido` para conferir itens
- `ConferenciaSP.finalizarConferencia` para finalizar
- `ConferenciaSP.excluirConferencia` para cancelar

---

## Serviços Sankhya Mapeados

### Endpoint `/mge/` (CRUDServiceProvider, DbExplorerSP, DatasetSP)
| Serviço | Uso |
|---|---|
| CRUDServiceProvider.loadRecords | Consultas com JOIN |
| CRUDServiceProvider.loadRecord | Registro único |
| DbExplorerSP.executeQuery | SQL complexo (SELECT) |
| DatasetSP.save | UPDATE de campos |
| MobileLoginSP.login | Autenticação de usuário |

### Endpoint `/mgecom/` (ConferenciaSP)
| Serviço | Uso |
|---|---|
| salvarCabecalhoConferencia | Iniciar conferência |
| listarItensPedido | Itens com divergência |
| getProduto | Buscar por código de barras |
| salvarItemConferido | Conferir item |
| getProdutosDivergentes | Divergências |
| finalizarConferencia | Finalizar |
| excluirConferencia | Cancelar |
| salvarVolumeSimplificado | Registrar volume |
| cortar | Cortar nota |
| getApenasExcluidosConferencia | Verificar excluídos |
| buscaIdentificador | Lote/serial |
| listarItensConferidos | Itens já conferidos |

---

## Descobertas Técnicas Importantes

1. **UPDATE:** Usar `DatasetSP.save` (não CRUDServiceProvider.saveRecord)
2. **Imagens:** `GET /gateway/v1/mge/Produto@IMAGEM@CODPROD={id}.dbimage`
3. **ConferenciaSP:** Usa `/mgecom/` (não `/mge/`)
4. **listarItensPedido:** Retorna apenas divergentes (itens conferidos somem)
5. **DbExplorerSP:** Apenas SELECT (não aceita UPDATE/INSERT)
6. **Sandbox:** Não permite escrita em TGFCON2, TGFCAB via CRUDServiceProvider

---

## Pendências / Próximos Passos

- [ ] Testar em ambiente de produção (escrita na TGFCON2)
- [ ] Leitor de código de barras via câmera (Capacitor plugin)
- [ ] Som/vibração ao conferir item
- [ ] Tratamento de divergências (tela de recontagem)
- [ ] Histórico de conferências
- [ ] Relatório de conferência finalizada
- [ ] Deploy (backend em servidor, frontend como APK)

---

## Como Rodar

```bash
# Backend
cd backend
npm install
npm run dev          # Hot reload na porta 3001

# Frontend
cd frontend
npm install
npm run dev          # Vite na porta 5173 (proxy para 3001)
```

## Git
Repositório: `sankhya-conferencia` (privado)
Branch: `master`
