# 🔐 Melhorias de Segurança — Sistema de Entregas com GPS

**Data**: 2 de Abril de 2026  
**Status**: ✅ Implementado e Compilado  
**Arquivo Modificado**: `backend/src/controllers/entregas.controller.ts`

---

## 📋 Resumo das Mudanças

O sistema de entregas foi refatorado para **reforçar a segurança** e prevenir acesso não autorizado. Abaixo estão as melhorias implementadas:

---

## 🔒 1. Validação de Permissões Rigorosa

### Problema
- Qualquer entregador autenticado podia atualizar/rejeitar **qualquer** entrega
- Não havia validação se o entregador é o "dono" da entrega aceita

### Solução
```typescript
async function validarPermissaoEntregador(
  entregaId: string,
  userIdAutenticado: string
): Promise<{ valido: boolean; erro?: string; entrega?: any }>
```

**Aplicada em:**
- ✅ `POST /api/entregas/:entregaId/rejeitar`
- ✅ `POST /api/entregas/:entregaId/gps`
- ✅ `POST /api/entregas/:entregaId/coleta`
- ✅ `POST /api/entregas/:entregaId/entregar`
- ✅ `POST /api/entregas/:entregaId/aceitar` (apenas para aceitar em nome de si)

**Comportamento:**
- Retorna **403 Forbidden** se entregador não é o dono
- Retorna **404 Not Found** se entrega não existe  
- Retorna **400 Bad Request** se entrega ainda não foi aceita

### Exemplo de Erro
```json
{
  "error": "Você não possui permissão para atualizar esta entrega"
}
```

---

## ⏱️ 2. Rate Limiting para GPS

### Problema
- Entregadores poderiam enviar GPS a cada milissegundo (spam)
- Teria sobrecarregado o banco de dados

### Solução
```typescript
const GPS_RATE_LIMIT_MS = 5000; // 5 segundos
const lastGpsUpdate = new Map<string, number>();

function verificarGpsRateLimit(deliveryId: string): {
  permitido: boolean;
  segundosAteProxima?: number;
}
```

**Comportamento:**
- Máximo **1 atualização de GPS a cada 5 segundos** por entrega
- Retorna **429 Too Many Requests** se exceder
- Indica quantos segundos até a próxima atualização ser aceita

### Exemplo de Erro
```json
{
  "error": "Muitas atualizações de GPS. Tente novamente em 3s"
}
```

---

## 🔄 3. Validação de Transições de Status

### Problema
- Qualquer estado poderia transicionar para qualquer outro estado
- Exemplo: Uma entrega já "ENTREGUE" poderia voltar para "A_CAMINHO_COLETA"

### Solução
```typescript
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  AGUARDANDO_COLETA: ['A_CAMINHO_COLETA'],
  A_CAMINHO_COLETA: ['A_CAMINHO_ENTREGA', 'AGUARDANDO_COLETA'],
  A_CAMINHO_ENTREGA: ['ENTREGUE'],
  ENTREGUE: [],
};
```

**Fluxo Válido:**
```
AGUARDANDO_COLETA
       ↓
A_CAMINHO_COLETA ←→ (pode rejeitar)
       ↓
A_CAMINHO_ENTREGA
       ↓
   ENTREGUE (final)
```

**Comportamento:**
- Retorna **400 Bad Request** se transição é inválida
- Mensagem clara explica qual transição foi negada

### Exemplo de Erro
```json
{
  "error": "Transição inválida: não é possível mudar de ENTREGUE para A_CAMINHO_COLETA"
}
```

---

## ✅ 4. Melhor Validação de Dados

### GPS - Coordenadas Válidas
```typescript
if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
  return res.status(400).json({ error: 'Coordenadas GPS inválidas' });
}
```

### Autenticação Obrigatória
- Todas as rotas verificam se `req.user` existe
- Retorna **401 Unauthorized** se token ausente/inválido

### Aceitar Entrega — Apenas para Si Mesmo
```typescript
if (entregadorId !== userIdAutenticado) {
  return res.status(403).json({
    error: 'Você só pode aceitar entregas para si mesmo'
  });
}
```

---

## 📊 Status HTTP Utilizados

| Código | Significado | Quando Usado |
|--------|-----------|------------|
| **200** | ✅ OK | Requisição bem-sucedida |
| **400** | ⚠️ Bad Request | Dados inválidos, transição inválida |
| **401** | 🔓 Unauthorized | Token ausente ou inválido |
| **403** | 🚫 Forbidden | Permissão negada (não é o dono) |
| **404** | ❌ Not Found | Entrega não encontrada |
| **429** | ⏱️ Too Many Requests | Rate limit de GPS excedido |
| **500** | 💥 Server Error | Erro interno do servidor |

---

## 🧪 Como Testar

### 1. Preparação
```bash
cd backend
npm run build  # ✅ Passou
npm run dev    # Inicia servidor na porta 3333
```

### 2. Teste: Atualizar GPS sem ser o Dono

```bash
# Assumir que você não é o dono da entrega "entrega-123"
# E que já foi aceita por outro entregador "entregador-456"

POST /api/entregas/entrega-123/gps
Authorization: Bearer {seu-token-entregador}
Content-Type: application/json

{
  "latitude": -23.5505,
  "longitude": -46.6333
}

# Resposta (esperado):
# 403 Forbidden
# {
#   "error": "Você não possui permissão para atualizar esta entrega"
# }
```

### 3. Teste: Rate Limiting de GPS

```bash
# 1ª chamada (OK)
POST /api/entregas/entrega-123/gps
{
  "latitude": -23.5505,
  "longitude": -46.6333
}
# 200 OK

# 2ª chamada imediatamente após (BLOQUEADA)
POST /api/entregas/entrega-123/gps
{
  "latitude": -23.5510,
  "longitude": -46.6335
}
# 429 Too Many Requests
# {
#   "error": "Muitas atualizações de GPS. Tente novamente em 5s"
# }
```

### 4. Teste: Transição de Status Inválida

```bash
# Tentar entregar quando status é "A_CAMINHO_COLETA"
POST /api/entregas/entrega-123/coleta
Authorization: Bearer {seu-token-entregador}

# (Supor que a entrega já está em entrega)
# Tentar voltar para AGUARDANDO_COLETA
POST /api/entregas/entrega-123/rejeitar
Authorization: Bearer {seu-token-entregador}

# Resposta:
# 400 Bad Request
# {
#   "error": "Transição inválida: não é possível mudar de A_CAMINHO_ENTREGA para AGUARDANDO_COLETA"
# }
```

---

## 📝 Implementação em Detalhes

### Antes (Inseguro)
```typescript
export async function confirmarEntrega(req: Request, res: Response) {
  try {
    const entregaId = String(req.params.entregaId);
    const { assinatura } = req.body;

    // ❌ Sem validação: QUALQUER entregador pode confirmar qualquer entrega
    const entregaAtualizada = await prisma.delivery.update({
      where: { id: entregaId },
      data: {
        status: 'ENTREGUE',
        entregueEm: new Date(),
        ...(assinatura && { assinatura }),
      },
    });
    // ...
  }
}
```

### Depois (Seguro)
```typescript
export async function confirmarEntrega(req: Request, res: Response) {
  try {
    const entregaId = String(req.params.entregaId);
    const userIdAutenticado = (req as any).user?.id;
    const { assinatura } = req.body;

    // ✅ Verificações de segurança
    if (!userIdAutenticado) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // ✅ Apenas dono pode confirmar
    const validacao = await validarPermissaoEntregador(entregaId, userIdAutenticado);
    if (!validacao.valido) {
      return res.status(403).json({ error: validacao.erro });
    }

    // ✅ Transição válida
    const transicao = validarTransicaoStatus(entrega.status, 'ENTREGUE');
    if (!transicao.valido) {
      return res.status(400).json({ error: transicao.erro });
    }

    // ... atualizar com segurança
  }
}
```

---

## 🚀 Próximos Passos (Opcionais)

1. **Auditoria**: Logar todas as alterações de entrega para auditoria
2. **Webhooks**: Notificar cliente em tempo real sobre mudança de status
3. **Distância**: Calcular distância entre pontos GPS
4. **ETA**: Estimar tempo de chegada baseado em velocidade
5. **Testes Automatizados**: Criar suite de testes Jest/Vitest

---

## ✅ Checklist de Validações

- [x] Autenticação obrigatória
- [x] Validação de permissão (dono da entrega)
- [x] Rate limiting para GPS
- [x] Validação de transições de status
- [x] Validação de coordenadas GPS
- [x] Status HTTP apropriados
- [x] Mensagens de erro descritivas
- [x] Compilação TypeScript bem-sucedida

---

**Desenvolvido por**: GitHub Copilot  
**Framework**: Express.js + Prisma  
**Banco de Dados**: PostgreSQL
