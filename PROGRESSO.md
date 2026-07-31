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

### Permissões / Conferência cega
- `frontend/src/domain/permissions.ts` com `podeVerCamposSensiveis()`
- Lista de privilegiados: `['SUP', 'ANTONY']` (aceita nome exato ou com sufixo `.`)
- Para usuários comuns, nas listas de pendentes **e** conferidos:
  - coluna **Pedido** (qtd negociada) omitida do header e das células
  - linha secundária mostra só o código do produto (sem código de barras e sem referência)
- Coluna **Conferido** permanece visível para todos
- **Limitação conhecida:** a ocultação é só visual. O backend continua enviando
  `codBarra`, `referencia` e `qtdPed` no JSON, então os valores aparecem no
  DevTools. Para bloquear de fato, filtrar em `ListarItensPedidoUseCase`
  decidindo pelo usuário da sessão.

### Alertas sonoros
- `frontend/src/infrastructure/audio/alertas.ts` com `tocarAlertaErro()`
- Som sintetizado pela Web Audio API (sem arquivo de áudio): não pesa no
  bundle, dispensa request de rede e funciona offline no coletor
- Dois bipes descendentes (660 Hz → 440 Hz, ~0,5 s) + `navigator.vibrate` no Android
- Disparado nos `catch` de `handleBuscarProduto` e `handleConferir`, e não num
  `useEffect` sobre `error`: se o operador repetir a mesma leitura recusada, a
  string de erro não muda e o efeito não voltaria a disparar
- Falha em silêncio se a API não existir no dispositivo

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

- [x] Deploy em Docker no servidor Linux — ver **[DEPLOY.md](DEPLOY.md)**
- [x] Som/vibração no **erro** de conferência
- [ ] Som/vibração de confirmação no **sucesso** da conferência
- [ ] Ocultação de campos sensíveis também no backend (hoje só visual)
- [ ] Testar em ambiente de produção (escrita na TGFCON2)
- [ ] Leitor de código de barras via câmera (Capacitor plugin)
- [ ] Tratamento de divergências (tela de recontagem)
- [ ] Histórico de conferências
- [ ] Relatório de conferência finalizada
- [ ] Empacotar frontend como APK (Capacitor)
- [ ] TLS / proxy reverso por hostname (Zabbix ocupa 80 e 443 no servidor)

---

## Como Rodar

### Desenvolvimento (local)

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

Antes de commitar mudanças no frontend, validar a tipagem — o build da imagem
Docker roda `tsc -b` e falha se houver erro de tipo:

```bash
cd frontend && npx tsc -b
```

### Produção (Docker no servidor Linux)

```bash
cd /opt/conferencia
git pull
docker-compose up -d --build
```

Aplicação em `http://IP_DO_SERVIDOR:8080`. Detalhes de ambiente, variáveis,
verificação e problemas já resolvidos em **[DEPLOY.md](DEPLOY.md)**.

## Documentação do projeto

| Documento | Conteúdo |
|---|---|
| [SANKHYA_API_GUIDE.md](SANKHYA_API_GUIDE.md) | Conexão, consulta e escrita na API Sankhya |
| [DEPLOY.md](DEPLOY.md) | Deploy Docker no servidor, operação e troubleshooting |
| [backend/ARCHITECTURE.md](backend/ARCHITECTURE.md) | Clean Architecture do backend |
| [backend/AUTH_API.md](backend/AUTH_API.md) | Endpoints de autenticação |
| [backend/CONFERENCIA_API.md](backend/CONFERENCIA_API.md) | Endpoints de conferência |
| [backend/CRUD_API.md](backend/CRUD_API.md) | Endpoints CRUD genéricos |
| [frontend/LOTTIE.md](frontend/LOTTIE.md) | Padrão de uso das animações Lottie |
| [frontend/MOBILE.md](frontend/MOBILE.md) | Build mobile com Capacitor |

## Git
Repositório: `https://github.com/Antonybarbosa/inovace-conferencia.git` (privado)
Branch: `master`
