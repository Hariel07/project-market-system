# CHECKLIST MVP — Market System

> Documento de referência para Claude Code ou outra IA completar o MVP operacional.
> Gerado em: 2026-04-09 | Baseado em auditoria completa do codebase.

---

## Visão geral

O objetivo é deixar o fluxo completo **Cliente compra → Comerciante prepara → Entregador entrega** 100% funcional, sem dados fictícios, com todos os perfis operacionais e o site responsivo.

---

## FASE 1 — Dados Reais (eliminar todo mock data)

> Prioridade máxima. Sem isso nada funciona de verdade.

### 1.1 `ProdutoPage.tsx` — CRÍTICO ❌
- **Arquivo**: `frontend/src/modules/cliente/ProdutoPage.tsx`
- **Problema**: Importa `itensMock` e `comerciosMock` do arquivo de mocks. Busca produto por ID no array mock. Não faz nenhuma chamada de API.
- **Solução**: Substituir por `api.get('/produtos/:id')` com include do comércio. Remover imports de mock.
- **Backend**: Verificar se `GET /api/produtos/:id` existe e retorna o produto com dados do comércio (nome, logo, taxa entrega).

### 1.2 `EntregadorGanhos.tsx` — CRÍTICO ❌
- **Arquivo**: `frontend/src/modules/entregador/EntregadorGanhos.tsx`
- **Problema**: Dados 100% mock inline (`ganhosMock` hardcoded linhas 28-58). Nenhuma chamada de API.
- **Solução**:
  - **Backend**: Criar endpoint `GET /api/financeiro/ganhos?periodo=hoje|semana|mes|ano` que agrupa entregas finalizadas do entregador por período e retorna totais.
  - **Frontend**: Substituir mock por chamada real. Manter a UI existente.

### 1.3 `EntregadorDashboard.tsx` — PARCIAL ⚠️
- **Arquivo**: `frontend/src/modules/entregador/EntregadorDashboard.tsx`
- **Problema**: Faz `GET /entregas/oportunidades` mas cai em fallback para `oportunidadesMock` se a API falha ou retorna vazio.
- **Solução**: Remover import de `oportunidadesMock`. Mostrar empty state real ("Nenhuma entrega disponível no momento") ao invés de dados fake.

### 1.4 `EntregadorHistorico.tsx` — PARCIAL ⚠️
- **Arquivo**: `frontend/src/modules/entregador/EntregadorHistorico.tsx`
- **Problema**: Faz `GET /entregas/historico` mas cai em fallback para `historicoMock`.
- **Solução**: Remover import de `historicoMock`. Empty state real quando sem histórico.

### 1.5 Limpar arquivos de mock não utilizados
- **Após** as correções acima, verificar se os arquivos abaixo ainda são importados em algum lugar. Se não, deletar:
  - `frontend/src/data/entregadorMock.ts`
  - `frontend/src/data/comercianteMock.ts`
  - `frontend/src/data/adminMock.ts`
- **Manter** `frontend/src/data/mockData.ts` apenas se `formatPrice` ainda for usado (é utility, não mock). Idealmente mover `formatPrice` para `frontend/src/lib/utils.ts`.

---

## FASE 2 — Fluxo completo do Pedido (ponta a ponta)

> Garantir que o ciclo PENDENTE → PREPARANDO → PRONTO → SAIU_ENTREGA → ENTREGUE funcione sem interrupção.

### 2.1 Checkout do cliente → Criação do pedido
- **Arquivo**: `frontend/src/modules/cliente/CheckoutPage.tsx`
- **Status**: ✅ Já funcional — chama `POST /api/pedidos` com itens, endereço e pagamento.
- **Verificar**: Se o backend cria automaticamente um registro de `Delivery` (status AGUARDANDO_COLETA) na mesma transação do pedido.

### 2.2 Comerciante recebe e gerencia pedido
- **Arquivo**: `frontend/src/modules/comerciante/ComerciantePedidos.tsx`
- **Status**: ✅ Já funcional — polling a cada 30s, aceita/rejeita via `PATCH /api/pedidos/:id/status`.
- **Verificar**: Transição PRONTO deve disparar notificação/sinalização para entregadores. Se `PRONTO` não gera nenhum evento para o entregador, precisa conectar (webhook, polling, ou flag no delivery record).

### 2.3 Entregador vê pedido PRONTO e aceita
- **Arquivo**: `frontend/src/modules/entregador/EntregadorDashboard.tsx`
- **Status**: ⚠️ API existe (`GET /entregas/oportunidades`) mas precisa garantir que retorna entregas com status AGUARDANDO_COLETA vinculadas a pedidos com status PRONTO.
- **Verificar**: O endpoint `/entregas/oportunidades` filtra por `status = 'AGUARDANDO_COLETA'`? Garante que só mostra quando pedido está PRONTO?

### 2.4 Entregador coleta e entrega
- **Arquivo**: `frontend/src/modules/entregador/EntregadorRota.tsx`
- **Status**: ✅ Funcional — GPS tracking, coleta, entrega com assinatura.
- **Verificar**: Ao confirmar entrega (`POST /entregas/:id/entregar`), o backend atualiza o Order.status para ENTREGUE?

### 2.5 Cliente acompanha status
- **Arquivo**: `frontend/src/modules/cliente/PedidoStatusPage.tsx`
- **Status**: ✅ Funcional — mostra timeline de status e info do entregador.
- **Verificar**: Polling ou atualização em tempo real do status.

---

## FASE 3 — Proteção de Rotas (Auth Guards)

> Rotas protegidas dependem hoje da resposta 401 da API + interceptor. Precisa de guard no nível do router.

### 3.1 Criar componente `PrivateRoute`
- **Criar**: `frontend/src/shared/components/PrivateRoute.tsx`
- **Lógica**: Verifica se existe token válido (não expirado) no localStorage. Se não, redireciona para `/login?redirect=<rota_atual>`.
- **Usar** a função `isTokenValid` já existente em `App.tsx`.

### 3.2 Proteger rotas que exigem login
- **Arquivo**: `frontend/src/App.tsx`
- **Rotas a proteger**:
  - `/checkout` — requer CLIENTE logado
  - `/pedidos`, `/pedido/:id` — requer CLIENTE logado
  - `/perfil`, `/enderecos/*` — requer CLIENTE logado
  - `/comerciante/*` — requer DONO/GERENTE/CAIXA/ESTOQUE/AJUDANTE_GERAL/GARCOM
  - `/entregador/*` — requer ENTREGADOR
  - `/admin/*` — requer ADMIN
- **Rotas públicas** (sem guard):
  - `/`, `/mercados`, `/mercado/:id`, `/produto/:id`, `/carrinho`
  - `/login`, `/cadastro`

### 3.3 Redirect após login
- Quando o usuário é redirecionado para `/login?redirect=/checkout`, após login bem-sucedido, redirecionar de volta para a rota original.
- **Verificar**: `LoginPage.tsx` já lê `searchParams.get('redirect')`? Se não, implementar.

---

## FASE 4 — Responsividade

> O CSS base já tem media queries e design system. Falta ajustar componentes específicos.

### 4.1 Auditar e corrigir páginas do comerciante
- **Prioridade**: ComerciantePedidos, ComercianteCatalogo, ComercianteEstoque, ComercianteDashboard
- **Problemas típicos**: Tabelas que não cabem em mobile, sidebars fixas que cobrem conteúdo, grids que não colapsam.
- **Solução**: Cada tabela vira cards em mobile (`@media (max-width: 768px)`). Sidebar colapsa em hamburger menu.

### 4.2 Auditar e corrigir páginas do entregador
- **Prioridade**: EntregadorDashboard, EntregadorRota
- **EntregadorRota**: Verificar se o mapa/GPS funciona em telas pequenas.

### 4.3 Auditar e corrigir páginas do admin
- **Prioridade**: AdminComercios, AdminUsuarios
- **Mesmo padrão**: Tabelas → cards em mobile.

### 4.4 PDV (ComerciantePDV.tsx)
- **Problema**: Layout grid 2 colunas não funciona em telas < 768px.
- **Solução**: Em mobile, empilhar (coluna única): busca → carrinho → pagamento. Ou oferecer modo "landscape forçado" para tablets.

### 4.5 TopBar e BottomNav
- **Verificar**: TopBar esconde elementos em mobile (`hide-mobile` class). BottomNav aparece apenas em rotas do cliente.
- **Testar**: Login page, cadastro page, páginas do comerciante — sem nav duplicada.

---

## FASE 5 — Polimentos finais para MVP

### 5.1 Mover `formatPrice` para utils
- **De**: `frontend/src/data/mockData.ts`
- **Para**: `frontend/src/lib/utils.ts`
- Atualizar todos os imports (±10 arquivos).
- Deletar `mockData.ts` se ficar vazio após remoção.

### 5.2 Notificações reais
- **Verificar**: `NotificationCenter.tsx` faz polling real a `/notificacoes`. Se o backend não gera notificações (ex: "Novo pedido!", "Entregador a caminho"), o componente fica vazio.
- **Ideal para MVP**: Pelo menos gerar notificação automática ao criar pedido (para comerciante) e ao aceitar entrega (para cliente).

### 5.3 Seed funcional
- **Verificar**: `backend/prisma/seed.ts` cria dados mínimos para testar: 1 admin, 1 comerciante com produtos e categorias, 1 cliente, 1 entregador.
- Se não existe ou está desatualizado, atualizar.

### 5.4 Testes manuais end-to-end
- [ ] Criar conta de cliente → navegar mercados → adicionar ao carrinho → checkout → ver pedido
- [ ] Logar como comerciante → ver pedido pendente → aceitar → marcar como preparando → marcar como pronto
- [ ] Logar como entregador → ver oportunidade → aceitar → confirmar coleta → confirmar entrega
- [ ] Logar como cliente → ver pedido atualizado como ENTREGUE
- [ ] Logar como admin → ver dashboard com dados reais
- [ ] Testar todos os fluxos em viewport mobile (375px)

---

## Ordem de execução recomendada

```
FASE 1 (Dados reais)      ███████████  ← Começar aqui
  1.1 ProdutoPage API
  1.2 EntregadorGanhos API
  1.3 EntregadorDashboard sem mock
  1.4 EntregadorHistorico sem mock
  1.5 Limpar arquivos mock

FASE 2 (Fluxo ponta a ponta) ████████
  2.1 Verificar checkout→pedido
  2.2 Verificar comerciante→entregador
  2.3 Verificar oportunidades
  2.4 Verificar entrega→status
  2.5 Verificar tracking cliente

FASE 3 (Auth guards)      ██████
  3.1 PrivateRoute component
  3.2 Proteger rotas
  3.3 Redirect pós-login

FASE 4 (Responsividade)   █████████
  4.1 Comerciante mobile
  4.2 Entregador mobile
  4.3 Admin mobile
  4.4 PDV mobile/tablet
  4.5 TopBar/BottomNav

FASE 5 (Polimentos)       ████
  5.1 formatPrice → utils
  5.2 Notificações
  5.3 Seed
  5.4 Testes E2E
```

---

## Referência rápida: Endpoints backend existentes

| Método | Rota | Função | Status |
|--------|------|--------|--------|
| POST | `/api/pedidos` | Criar pedido (checkout) | ✅ |
| GET | `/api/pedidos/meus` | Pedidos do cliente | ✅ |
| GET | `/api/pedidos/comercio` | Pedidos do comerciante | ✅ |
| GET | `/api/pedidos/:id` | Detalhe do pedido | ✅ |
| PATCH | `/api/pedidos/:id/status` | Atualizar status | ✅ |
| GET | `/api/entregas/oportunidades` | Entregas disponíveis | ✅ |
| GET | `/api/entregas/entregador/:id` | Entregas do entregador | ✅ |
| POST | `/api/entregas/:id/aceitar` | Aceitar entrega | ✅ |
| POST | `/api/entregas/:id/gps` | Atualizar GPS | ✅ |
| POST | `/api/entregas/:id/coleta` | Confirmar coleta | ✅ |
| POST | `/api/entregas/:id/entregar` | Confirmar entrega | ✅ |
| GET | `/api/entregas/historico` | Histórico entregas | ✅ |
| GET | `/api/financeiro/ganhos` | Ganhos do entregador | ❌ CRIAR |
| GET | `/api/produtos/:id` | Detalhe produto | ❓ VERIFICAR |
| GET | `/api/comercios/public` | Lojas públicas | ✅ |
| GET | `/api/categorias/public` | Categorias públicas | ✅ |
| POST | `/api/caixa/venda` | Venda PDV | ✅ |
| POST | `/api/caixa/movimentos` | Movimento caixa | ✅ |

---

## Arquivos de mock para eliminar

| Arquivo | Importado por | Ação |
|---------|--------------|------|
| `data/mockData.ts` | ±10 arquivos (apenas `formatPrice`) | Mover `formatPrice` → `lib/utils.ts`, deletar |
| `data/entregadorMock.ts` | EntregadorDashboard, EntregadorHistorico | Remover imports, deletar arquivo |
| `data/comercianteMock.ts` | Verificar se ainda importado | Deletar se não usado |
| `data/adminMock.ts` | Verificar se ainda importado | Deletar se não usado |
