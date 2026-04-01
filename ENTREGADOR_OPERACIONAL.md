# 📦 Sistema de Entregas - Guia Operacional

## 🚀 Como Usar

### Backend (API de Entregas)

As rotas de entrega foram registradas em `/api/entregas` e oferecem os seguintes endpoints:

#### 1. Listar Oportunidades de Entrega
```
GET /api/entregas/oportunidades
```
Retorna todos os pedidos disponíveis para entrega (status PREPARANDO ou PRONTO).

#### 2. Aceitar uma Entrega
```
POST /api/entregas/:entregaId/aceitar
Body: { entregadorId: "uuid" }
```
Marca uma entrega como aceita pelo entregador.

#### 3. Rejeitar uma Entrega
```
POST /api/entregas/:entregaId/rejeitar
```
Libera a entrega para outro entregador.

#### 4. Enviar Localização GPS
```
POST /api/entregas/:entregaId/gps
Body: { latitude: number, longitude: number }
```
Registra a posição GPS do entregador em tempo real.

#### 5. Confirmar Coleta
```
POST /api/entregas/:entregaId/coleta
```
Marca que o pedido foi coletado no restaurante/loja.

#### 6. Confirmar Entrega
```
POST /api/entregas/:entregaId/entregar
Body: { assinatura?: "base64" }
```
Marca a entrega como completa.

#### 7. Listar Minhas Entregas Ativas
```
GET /api/entregas/entregador/:entregadorId
```
Retorna todas as entregas ativas do entregador.

---

### Frontend (Tela Entregador)

#### **Dashboard (EntregadorDashboard.tsx)**
- **Status Online/Offline**: Toggle para aparecer na plataforma
- **Resumo do Dia**: Ganhos, corridas realizadas, taxa de aceitação
- **Radar de Demanda**: Mostra áreas com alta demanda
- **Lista de Oportunidades**: Corridas disponíveis carregadas da API

#### **Tela de Rota (EntregadorRota.tsx)**

**Funcionalidades Integradas:**

1. **GPS em Tempo Real**
   - Captura a localização do dispositivo continuamente
   - Mostra velocidade atual e coordenadas
   - Traça a rota percorrida no mapa

2. **4 Etapas da Entrega**
   - **Etapa 1**: Navegando para coleta (início automático do GPS)
   - **Etapa 2**: Confirmado na coleta (coletou o pedido)
   - **Etapa 3**: Navegando para entrega (GPS ativo novamente)
   - **Etapa 4**: Confirmado na entrega (finalizar)

3. **Mapa Integrado (Leaflet)**
   - Marcador do entregador (moto)
   - Ponto de coleta (loja/restaurante)
   - Ponto de entrega (cliente)
   - Linha da rota esperada (tracejada)
   - Linha da rota percorrida (sólida)
   - Raio de precisão GPS

4. **Auto-Confirmação**
   - Ao chegar a 50m do destino, o sistema auto-confirma a chegada
   - Reduz a necessidade de clicks

5. **Informações do Pedido**
   - Valor da entrega
   - Distância até o destino
   - Dados do restaurante/loja
   - Dados do cliente (telefone, endereço)
   - Número do pedido

---

## 🔧 Configuração Necessária

### Variáveis de Ambiente (.env)
```
PORT=3333
DATABASE_URL="postgresql://user:password@localhost:5432/market_system"
JWT_SECRET="sua_chave_secreta_aqui"
```

### Permissões do Navegador
O sistema requer permissão para acessar:
- **Geolocalização**: Necessário para capturar GPS
- **Câmera** (opcional): Para assinatura de entrega

---

## 🎯 Fluxo Típico de Entrega

1. **Entregador ativa "Online"** → Dashboard carrega oportunidades
2. **Clica em uma corrida** → Abre tela de rota
3. **Clica em "Iniciar Navegação"** → GPS começa a funcionar
4. **Navega até a loja** → Mapa mostra progresso
5. **Chega na loja** → Sistema auto-confirma ou clica manualmente
6. **Clica "Confirmar Coleta"** → Etapa 2
7. **Clica "Iniciar Navegação para Cliente"** → GPS reativa
8. **Chega no cliente** → Auto-confirma ou clica manualmente
9. **Clica "Finalizar Entrega"** → Entrega completa, volta ao dashboard

---

## 📊 Dados Armazenados

### Modelo Delivery (Backend)
```typescript
model Delivery {
  id: string              // UUID único
  pedidoId: string        // Referência ao pedido
  entregadorId?: string   // ID do entregador
  status: string          // Estado da entrega
  taxaRepasse?: number    // Quanto entregador ganha
  coletadoEm?: DateTime   // Timestamp coleta
  entregueEm?: DateTime   // Timestamp entrega
}
```

### Histórico de GPS
Os dados de GPS são enviados à API (`POST /api/entregas/:entregaId/gps`) com:
- Latitude
- Longitude
- Velocidade
- Precisão
- Timestamp

---

## 🐛 Troubleshooting

### GPS não funciona
- Verificar se o navegador tem permissão de geolocalização
- Testar em HTTPS (obrigatório para produção)
- Verificar se o dispositivo tem GPS/dados móveis

### Mapa não carrega
- Verificar conexão com internet (OpenStreetMap precisa carregar tiles)
- Limpar cache do navegador
- Tentar em outro navegador

### Erro ao aceitar entrega
- Verificar se entrega ainda está disponível (outro entregador pode ter aceitado)
- Verificar conexão com a API
- Revisar token JWT no localStorage

---

## 🚀 Próximas Melhorias

- [ ] Integração com Redis para histórico de GPS em tempo real
- [ ] Notificações push quando novas corridas aparecem
- [ ] Assinatura de entrega com foto + coordenadas
- [ ] Cálculo automático de melhor rota (integração com Google Maps)
- [ ] Rating do entregador após cada entrega
- [ ] Integração com sistema de pagamento para repasse
- [ ] Suporte para múltiplas entregas em rota
- [ ] Chat em tempo real com cliente e restaurante

---

**Desenvolvido como parte do Project Market System - Sistema Open Source de Gestão.**
