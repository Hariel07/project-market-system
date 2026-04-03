// 🧪 TESTER - Scripts para Testar API de Entregas
// Copie cada função abaixo e execute no DevTools ou teste com curl/Postman

// ============================================================================
// CONFIGURAÇÕES INICIAIS
// ============================================================================

const API_BASE = 'http://localhost:3333';
const TOKEN_ENTREGADOR_1 = 'seu-token-jwt-entregador-1'; // Exemplo
const TOKEN_ENTREGADOR_2 = 'seu-token-jwt-entregador-2'; // Outro entregador
const ENTREGA_ID = 'uuid-da-entrega-aqui';
const ENTREGADOR_ID_1 = 'uuid-entregador-1';
const ENTREGADOR_ID_2 = 'uuid-entregador-2';

// ============================================================================
// TESTE 1: Listar Oportunidades de Entrega (NÃO ACEITAS)
// ============================================================================

async function teste_listarOportunidades() {
  console.log('📋 TESTE: Listar Oportunidades de Entrega');
  console.log('-------------------------------------------');

  try {
    const response = await fetch(`${API_BASE}/api/entregas/oportunidades`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN_ENTREGADOR_1}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Resposta:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ============================================================================
// TESTE 2: Aceitar uma Entrega
// ============================================================================

async function teste_aceitarEntrega() {
  console.log('✅ TESTE: Aceitar Entrega');
  console.log('-------------------------------------------');

  try {
    const response = await fetch(`${API_BASE}/api/entregas/${ENTREGA_ID}/aceitar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN_ENTREGADOR_1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entregadorId: ENTREGADOR_ID_1, // Deve ser o ID do usuário autenticado
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Resposta:', JSON.stringify(data, null, 2));

    if (response.status === 200) {
      console.log('✅ Entrega aceita com sucesso!');
    } else if (response.status === 403) {
      console.log('🚫 Você só pode aceitar entregas para si mesmo');
    } else if (response.status === 400) {
      console.log('⚠️ Entrega já foi aceita por outro entregador');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ============================================================================
// TESTE 3: Atualizar GPS (1ª chamada - SUCESSO)
// ============================================================================

async function teste_gps_primeira_chamada() {
  console.log('📍 TESTE: Atualizar GPS (1ª Chamada)');
  console.log('-------------------------------------------');

  try {
    const response = await fetch(`${API_BASE}/api/entregas/${ENTREGA_ID}/gps`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN_ENTREGADOR_1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: -23.5505,   // São Paulo
        longitude: -46.6333,
        velocidade: 45.5,     // km/h
        precisao: 5.0,        // metros
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Resposta:', JSON.stringify(data, null, 2));

    if (response.status === 200) {
      console.log('✅ GPS registrado com sucesso!');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ============================================================================
// TESTE 4: Atualizar GPS (2ª chamada imediata - BLOQUEADA por Rate Limit)
// ============================================================================

async function teste_gps_rate_limit() {
  console.log('⏱️ TESTE: Rate Limiting de GPS (deve bloquear)');
  console.log('-------------------------------------------');

  try {
    const response = await fetch(`${API_BASE}/api/entregas/${ENTREGA_ID}/gps`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN_ENTREGADOR_1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: -23.5510,
        longitude: -46.6335,
        velocidade: 50.0,
        precisao: 5.0,
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Resposta:', JSON.stringify(data, null, 2));

    if (response.status === 429) {
      console.log('✅ Rate limit funcionando! Bloqueou atualização muito rápida');
    } else if (response.status === 200) {
      console.log('⚠️ GPS foi aceito (rate limit pode estar desativado ou > 5s passou)');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ============================================================================
// TESTE 5: Atualizar GPS com Coordenadas Inválidas
// ============================================================================

async function teste_gps_invalido() {
  console.log('🚫 TESTE: GPS com Coordenadas Inválidas');
  console.log('-------------------------------------------');

  try {
    const response = await fetch(`${API_BASE}/api/entregas/${ENTREGA_ID}/gps`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN_ENTREGADOR_1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: 95.0,  // INVÁLIDO: latitude máxima é 90
        longitude: -46.6333,
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Resposta:', JSON.stringify(data, null, 2));

    if (response.status === 400) {
      console.log('✅ Validação funcionando! Coordenadas rejeitadas');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ============================================================================
// TESTE 6: GPS - Outro Entregador Tenta Atualizar (PERMISSÃO NEGADA)
// ============================================================================

async function teste_gps_permissao_negada() {
  console.log('🚫 TESTE: GPS - Outro Entregador Tenta Atualizar');
  console.log('-------------------------------------------');

  try {
    const response = await fetch(`${API_BASE}/api/entregas/${ENTREGA_ID}/gps`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN_ENTREGADOR_2}`, // ← OUTRO ENTREGADOR
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: -23.5505,
        longitude: -46.6333,
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Resposta:', JSON.stringify(data, null, 2));

    if (response.status === 403) {
      console.log('✅ Permissão validada! Outro entregador foi bloqueado');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ============================================================================
// TESTE 7: Confirmar Coleta
// ============================================================================

async function teste_confirmarColeta() {
  console.log('📦 TESTE: Confirmar Coleta');
  console.log('-------------------------------------------');

  try {
    const response = await fetch(`${API_BASE}/api/entregas/${ENTREGA_ID}/coleta`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN_ENTREGADOR_1}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Resposta:', JSON.stringify(data, null, 2));

    if (response.status === 200) {
      console.log('✅ Coleta confirmada! Status mudou para A_CAMINHO_ENTREGA');
    } else if (response.status === 400) {
      console.log('⚠️ Transição de status inválida (pode estar em status inválido)');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ============================================================================
// TESTE 8: Confirmar Entrega Completa
// ============================================================================

async function teste_confirmarEntrega() {
  console.log('✅ TESTE: Confirmar Entrega Completa');
  console.log('-------------------------------------------');

  try {
    const response = await fetch(`${API_BASE}/api/entregas/${ENTREGA_ID}/entregar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN_ENTREGADOR_1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // assinatura: 'data:image/png;base64,...', // Opcional: base64 da assinatura
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Resposta:', JSON.stringify(data, null, 2));

    if (response.status === 200) {
      console.log('✅ Entrega concluída! Status mudou para ENTREGUE');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ============================================================================
// TESTE 9: Rejeitar Entrega
// ============================================================================

async function teste_rejeitarEntrega() {
  console.log('❌ TESTE: Rejeitar Entrega');
  console.log('-------------------------------------------');

  try {
    const response = await fetch(`${API_BASE}/api/entregas/${ENTREGA_ID}/rejeitar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN_ENTREGADOR_1}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Resposta:', JSON.stringify(data, null, 2));

    if (response.status === 200) {
      console.log('✅ Entrega rejeitada! Voltou para AGUARDANDO_COLETA');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ============================================================================
// TESTE 10: Listar Minhas Entregas Ativas
// ============================================================================

async function teste_minhasEntregas() {
  console.log('📋 TESTE: Minhas Entregas Ativas');
  console.log('-------------------------------------------');

  try {
    const response = await fetch(
      `${API_BASE}/api/entregas/entregador/${ENTREGADOR_ID_1}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${TOKEN_ENTREGADOR_1}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Resposta:', JSON.stringify(data, null, 2));

    if (response.status === 200) {
      console.log(`✅ Encontradas ${data.length} entregas ativas`);
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ============================================================================
// EXECUÇÃO SEQUENCIAL (PARA TESTAR FLUXO COMPLETO)
// ============================================================================

async function testeFluxoCompleto() {
  console.log('🚀 INICIANDO TESTES DE FLUXO COMPLETO');
  console.log('='.repeat(60));

  // Aguardar 2 segundos entre testes para facilitar leitura
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  console.log('\n1️⃣ Listando oportunidades...');
  await teste_listarOportunidades();
  await delay(2000);

  console.log('\n2️⃣ Aceitando uma entrega...');
  await teste_aceitarEntrega();
  await delay(2000);

  console.log('\n3️⃣ Enviando primeira localização GPS...');
  await teste_gps_primeira_chamada();
  await delay(1000);

  console.log('\n4️⃣ Tentando enviar GPS muito rapidamente (rate limit)...');
  await teste_gps_rate_limit();
  await delay(6000); // Aguardar rate limit resetar

  console.log('\n5️⃣ Outro entregador tenta atualizar GPS (permissão negada)...');
  await teste_gps_permissao_negada();
  await delay(2000);

  console.log('\n6️⃣ Confirmando coleta...');
  await teste_confirmarColeta();
  await delay(2000);

  console.log('\n7️⃣ Confirmando entrega...');
  await teste_confirmarEntrega();
  await delay(2000);

  console.log('\n8️⃣ Listando minhas entregas ativas...');
  await teste_minhasEntregas();

  console.log('\n' + '='.repeat(60));
  console.log('✅ TESTES CONCLUÍDOS!');
}

// ============================================================================
// COMO USAR
// ============================================================================

/*
OPÇÃO 1: Executar individualmente no console do navegador
---
1. Abra DevTools (F12) → Console
2. Cole o código deste arquivo
3. Execute qualquer teste:
   - teste_listarOportunidades()
   - teste_aceitarEntrega()
   - teste_gps_primeira_chamada()
   - teste_gps_rate_limit()
   - etc.

OPÇÃO 2: Executar fluxo completo
---
testeFluxoCompleto()

OPÇÃO 3: Com curl (no terminal)
---
curl -X GET http://localhost:3333/api/entregas/oportunidades \
  -H "Authorization: Bearer seu-token-jwt" \
  -H "Content-Type: application/json"

OPÇÃO 4: Com Postman/Insomnia
---
1. Importe as rotas do arquivo entregas.routes.ts
2. Configure o token JWT nos headers
3. Ajuste as variáveis de ENTREGA_ID, ENTREGADOR_ID, etc.
*/
