# 🧪 Guia de Testes - Sistema de Entregas com GPS

## 📋 Pré-requisitos

1. **Banco de dados rodando**
   ```bash
   # Verificar se PostgreSQL está disponível
   # A variável DATABASE_URL deve estar configurada no .env
   ```

2. **Backend compilado**
   ```bash
   cd backend
   npm run build
   ```

3. **Frontend compilado**
   ```bash
   cd frontend
   npm run build
   ```

4. **Portas disponíveis**
   - Backend: `3333`
   - Frontend: `5173` (ou configurado no vite)

---

## 🚀 TESTE 1: Iniciar os Servidores

### Passo 1: Abrir 2 terminais

**Terminal 1 - Backend:**
```bash
cd c:\GitFull\project-market-system\backend
npm run dev
```

Esperado: 
```
🚀 Servidor backend rodando na porta 3333
```

**Terminal 2 - Frontend:**
```bash
cd c:\GitFull\project-market-system\frontend
npm run dev
```

Esperado:
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## 🔌 TESTE 2: Testar API de Entregas (com Postman/cURL)

### 2.1 - Verificar Status do Servidor
```bash
curl http://localhost:3333/api/status
```

**Resposta esperada:**
```json
{
  "status": "Online",
  "message": "Market System API rodando perfeitamente!"
}
```

### 2.2 - Listar Oportunidades de Entrega
```bash
curl -X GET http://localhost:3333/api/entregas/oportunidades \
  -H "Authorization: Bearer seu_token_jwt"
```

**Resposta esperada:**
```json
[
  {
    "id": "...",
    "pedidoId": "...",
    "status": "PENDENTE",
    "cliente": { ... },
    "comercio": { ... },
    "itens": [ ... ]
  }
]
```

*Nota: Se o banco estiver vazio, retornará `[]`. Isso é OK.*

### 2.3 - Testar Envio de GPS
```bash
curl -X POST http://localhost:3333/api/entregas/{entregaId}/gps \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -23.5617,
    "longitude": -46.6560,
    "velocidade": 25.5,
    "precisao": 10
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Localização atualizada",
  "data": {
    "entregaId": "...",
    "latitude": -23.5617,
    "longitude": -46.6560,
    "timestamp": "2026-04-01T..."
  }
}
```

---

## 🌐 TESTE 3: Testar Frontend (Navegador)

### 3.1 - Abrir a Aplicação
1. Abra http://localhost:5173 no navegador
2. Faça login como entregador (ou use mock data se disponível)
3. Navegue para `/entregador`

### 3.2 - Testar Dashboard (EntregadorDashboard.tsx)

**Passos:**
1. Vá para a tela "Entregador → Início"
2. Você deve ver um **toggle Online/Offline**
3. Você deve ver **"Resumo de Hoje"** quando estiver offline

**Esperado:**
```
Você está Offline
Fique online para receber pedidos

Resumo de Hoje
├─ Ganhos: R$ 142,50
├─ Corridas: 8
├─ Aceitação: 92%
└─ Nota: ⭐ 4.9
```

### 3.3 - Ativar Modo Online
1. **Clique no toggle "Online"**
2. Aguarde 2-3 segundos para carregar as oportunidades

**Esperado:**
```
Você está Online
Procurando corridas perto de você...

📡 Carregando oportunidades... (3-5 segundos)

Corridas Disponíveis
├─ Burger House - R$ 12,50 (25 min)
├─ Mercado Bom Preço - R$ 18,00 (35 min)
└─ Farmácia Saúde+ - R$ 8,50 (15 min)
```

---

## 🗺️ TESTE 4: Testar Tela de Rota com GPS

### 4.1 - Clicar em uma Corrida
1. Clique em qualquer oportunidade na lista
2. Você será levado a `/entregador/rota/{id}`

**Esperado:**
- ✅ Mapa carrega (OpenStreetMap/Leaflet)
- ✅ Moto (seu pino) aparece no centro
- ✅ Ponto de coleta (loja) marcado com 🏬
- ✅ Ponto de entrega (cliente) marcado com 🏠
- ✅ Rota tracejada entre os dois pontos

### 4.2 - Verificar Informações da Entrega
**Bottom Sheet deve mostrar:**
```
R$ 12,50
Valor da entrega

1.20 km
Distância até o destino

🏬 Coletar em
Burguer House
Av. Paulista, 1000 - Bela Vista

BOTÃO: 📍 Iniciar Navegação
```

### 4.3 - Testar Navegação com GPS (Etapa 1)

**Clique em "Iniciar Navegação":**

1. **Verificar permissão do GPS**
   - Navegador deve pedir permissão
   - ✅ Aceite a solicitação
   - Se negar, verá aviso: "⚠️ Erro GPS: ..."

2. **GPS deve ativar**
   - ✅ Card com dados GPS aparece
   - ✅ Coordenadas aparecem (ex: `-23.561700, -46.656000`)
   - ✅ Raio azul aparece no mapa (precisão)
   - ✅ Linha verde aparece (rota percorrida)

3. **Moto se move no mapa**
   - Seu pino se move em direção ao ponto de coleta
   - Distância diminui: `1.20km → 1.15km → 1.10km...`

4. **Auto-confirmação**
   - Quando chegar a **50m do destino**, o sistema auto-confirma
   - Passa para **Etapa 2** automaticamente

**Se preferir confirmar manualmente:**
- Clique no botão **"Parar Navegação"**
- Depois clique no botão agora da cor roxa: **"📦 Confirmar Coleta de Pedido"**

---

## 🧪 TESTE 5: Ciclo Completo de Entrega (4 Etapas)

### Etapa 1: Indo para Coleta ✅
```
[MAPA] Sua posição se move até a loja
[BOTÃO] "📍 Inicando (1.20km)"
[CARD] Mostra: "Coletar em: Burguer House"
[AUTO] Confirma quando chegar
```

### Etapa 2: Confirmando Coleta ✅
```
[HEADER] "Na Coleta"
[CARD] "Número do Pedido: #8942 - Confirme com o vendedor"
[BOTÃO] "📦 Confirmar Coleta de Pedido" (roxo/accent)
[CLIQUE] Passa para Etapa 3
```

### Etapa 3: Indo para Cliente ✅
```
[MAPA] Sua posição se move até o cliente
[BOTÃO] "📍 Navegando (3.50km)"
[CARD] Muda para: "Entregar para: Cliente"
[CARD] Endereço do cliente
[BOTÃO] Chat 💬 Ligar 📞 (botões bonus)
[AUTO] Confirma quando chegar
```

### Etapa 4: Entrega Completa ✅
```
[HEADER] "No Cliente"
[BOTÃO] "✅ Finalizar Entrega" (verde/accent)
[CLIQUE] 
  └─> Envia POST /api/entregas/{id}/entregar
  └─> Volta para Dashboard
  └─> Sucesso! ✨
```

---

## 📊 TESTE 6: Verificar Dados do GPS no Console

### No navegador (F12 → Console)

**Dados que devem ser enviados:**
```javascript
// Você verá logs assim:
POST https://localhost:3333/api/entregas/401/gps
{
  latitude: -23.5603246,
  longitude: -46.6565789,
  velocidade: 12.5,
  precisao: 21.3
}
// Response: 200 OK
```

### No terminal do Backend
```
GPS atualizado: {
  entregaId: '401',
  latitude: -23.5603246,
  longitude: -46.6565789,
  timestamp: 2026-04-01T...
}
```

---

## ⚠️ TESTE 7: Testar Cenários de Erro

### 7.1 - GPS Desativado
1. Vá para Settings do navegador
2. Desative "Location Services"
3. Clique "Iniciar Navegação"

**Resultado esperado:**
```
⚠️ Erro GPS: User denied geolocation
```

### 7.2 - Sem Conexão com Internet
1. Abra DevTools → Network → Offline
2. Clique "Iniciar Navegação"

**Resultado esperado:**
```
⚠️ Erro ao enviar GPS: Network Error
(Mas o mapa local continua funcionando)
```

### 7.3 - Rejeitar Entrega
1. Abra DevTools Console
2. Digite:
```javascript
// Simular rejeição (se implementado)
fetch('/api/entregas/401/rejeitar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}).then(r => r.json()).then(console.log)
```

---

## 🔍 TESTE 8: Validar Compilação

### Backend
```bash
cd backend
npm run build
```
✅ **Esperado:** Sem erros, arquivo `dist/` criado

### Frontend
```bash
cd frontend
npm run build
```
✅ **Esperado:** Sem erros, pasta `dist/` criada

---

## 🎯 CHECKLIST DE VALIDAÇÃO

- [ ] Backend inicia em porta 3333
- [ ] Frontend inicia em porta 5173
- [ ] API `/api/status` retorna 200 OK
- [ ] Dashboard carrega com toggle Online/Offline
- [ ] Clicando online carrega oportunidades
- [ ] Clicando em corrida abre mapa
- [ ] Mapa mostra 3 marcadores (moto, loja, cliente)
- [ ] Rota tracejada aparece
- [ ] Botão "Iniciar Navegação" ativa GPS
- [ ] Coordenadas atualizam em tempo real
- [ ] Distância diminui conforme se move
- [ ] 4 etapas funcionam em sequência
- [ ] Auto-confirmação funciona (50m)
- [ ] Parar navegação funciona
- [ ] Finalizar entrega volta ao dashboard
- [ ] Console não tem erros (F12)
- [ ] Compilação sem warnings

---

## 🐛 Debugging

### Verificar se API está recebendo GPS
```bash
# Terminal Backend
# Procure por logs tipo:
# GPS atualizado: { entregaId: '...', latitude: ..., longitude: ..., timestamp: ... }
```

### Verificar coordenadas no mapa
```javascript
// Console do DevTools
window.navigator.geolocation.getCurrentPosition(pos => {
  console.log(pos.coords);
})
```

### Ver requisições HTTP
DevTools → Network → Filter: XHR
- Procure por `POST .../gps`
- Status deve ser `200`

---

## ✨ Próximos Passos (Após Validar)

1. Conectar com dados reais do banco (não apenas mock)
2. Implementar autenticação JWT real
3. Testar com múltiplos entregadores simultaneamente
4. Implementar WebSocket para GPS em tempo real (ao invés de polling)
5. Testar em dispositivo móvel (Android/iOS) para GPS real

---

**Dúvidas durante os testes?** Verifique o console (F12) → Aba "Console" e "Network"
