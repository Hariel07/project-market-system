# 🛒 Project Market System

> **Sistema de gestão open source, gratuito e completo para qualquer comerciante.**
> Desenvolvido por Hariel Soares Maran como portfólio de Engenharia de Software e contribuição à comunidade.

Plataforma multi-segmento que cobre do cadastro de produtos compostos até PDV físico, emissão fiscal, RH, procurement, localização física de estoque, promoções agendadas, impressão de etiquetas e material de oferta, mídia digital e atendimento inteligente com IA. Projetado para ser um SaaS gratuito que qualquer desenvolvedor pode clonar, adaptar e evoluir.

> 💡 **Este projeto é uma base de conhecimento.**
> Construído seguindo o processo completo de Engenharia de Software — do briefing até o código — com o objetivo de documentar, de forma detalhada e didática, todas as decisões de arquitetura, requisitos e estrutura. A ideia é que um iniciante consiga entender não só **o que** o sistema faz, mas **por que** cada decisão foi tomada.

---

## 🌍 Por que este projeto existe

Sistemas de gestão para pequenos comércios são caros, fechados e monopolizados. Um comerciante que está começando paga mensalidade de software que ele mal pode bancar, por um sistema que não faz tudo que ele precisa e que não pode ser customizado.

Este projeto é a resposta a isso: um sistema completo, open source, gratuito, que qualquer desenvolvedor pode usar como base para criar sua própria solução ou contribuir com novos módulos. O comerciante ganha tecnologia de qualidade sem custo. O desenvolvedor ganha um portfólio real, completo e visível. A comunidade ganha uma alternativa digna aos sistemas proprietários.

---

## 🎯 Segmentos Atendidos

| Segmento | Exemplos de uso |
|---|---|
| 🍔 Restaurantes e Lanchonetes | Cardápio digital, comandas, garçom, QR Code de mesa, PDV |
| 🍺 Bares | Comandas, controle de bebidas, happy hour, caixa |
| 🛒 Mercados pequeno/médio porte | Catálogo, estoque, PDV, NF-e, etiquetas de gôndola, promoções |
| 💊 Farmácias | Lote, validade, FEFO, impostos, NFC-e, etiquetas adesivas |
| 🥖 Padarias | Receitas, produção, controle de perdas, validade, promoções |
| 🔨 Materiais de Construção | Kits, composição, venda por medida, NF-e |
| ⚙️ Serviços | Planos, combos, procurement de serviços |
| 🎓 Produtos Digitais | E-books, cursos em vídeo, templates, slides |
| 🏢 Qualquer negócio com equipe | RH, admissão, rescisão, controle de funcionários |

---

## 🎯 Metodologia de Desenvolvimento

```
1. Instalação e Configuração  →  Ambiente pronto (Docker, Node, pgAdmin)
2. Briefing e Requisitos      →  O que o sistema precisa fazer
3. Design de Telas (Figma)    →  Como o sistema vai parecer
4. Modelagem UML              →  Entidades, funções e relacionamentos
5. Arquitetura C4 Model       →  Visão macro até micro do sistema
6. Banco de Dados             →  Estrutura e scripts SQL
7. Código                     →  Modular, simplificado e comentado
```

> 💡 Código sem processo gera retrabalho. Esta sequência garante que cada linha escrita tem um motivo documentado.

---

## 👥 Atores do Sistema

| Ator | Tipo | Descrição |
|---|---|---|
| **Cliente** | Externo | Compra via app, QR Code ou PDV |
| **Comerciante (Dono)** | Interno — Nível 5 | Acesso total ao sistema do comércio |
| **Funcionário Gerente** | Interno — Nível 4 | Acesso total exceto configurações críticas |
| **Funcionário Estoque** | Interno — Nível 3 | Itens, fornecedores, entradas, compras, localização |
| **Funcionário Caixa** | Interno — Nível 2 | PDV, caixa, emissão fiscal, etiquetas |
| **Funcionário Garçom** | Interno — Nível 1 | Mapa de mesas, comandas |
| **Fornecedor** | Externo parceiro | Portal de pedidos de compra e envio de NF |
| **Entregador** | Externo | Aceita e realiza entregas com rastreamento gRPC |
| **Administrador** | Plataforma | Gestão global de todos os comércios |

---

## 🔐 Sistema de Permissões por Nível

> 💡 Com permissões granulares e perfis pré-definidos, o comerciante pode criar um "Caixa do turno da manhã" com acesso a um PDV específico sem escrever código novo.

```
Nível 5 — Dono         Tudo. Sem restrição.
Nível 4 — Gerente      Tudo exceto: excluir comércio, dados fiscais, RH completo
Nível 3 — Estoque      Itens · BOM · Fornecedores · Entradas · Procurement
                        Localização física · Validade/Lote · Etiquetas
Nível 2 — Caixa        PDV (1 ou mais) · Caixa · NFC-e · Vendas · Etiquetas · Promoções (leitura)
Nível 1 — Garçom       Mapa de mesas · Comandas · Lançar pedidos

✅ Perfis são pré-definidos mas 100% customizáveis por item de permissão
✅ Um funcionário pode ter múltiplos perfis simultâneos
✅ Permissões podem ser restritas a PDVs e locais físicos específicos
```

---

## 🗺️ Localização Física — Comércio e Estoque

> 💡 **WMS simplificado (Warehouse Management System).** Saber onde cada item está fisicamente elimina o "vai lá procurar" e conecta estoque, lotes e FEFO a coordenadas reais dentro do estabelecimento.

A hierarquia é flexível e recursiva — o comerciante define quantos níveis precisar, com nomes totalmente livres:

```
Comércio / Estabelecimento
  └── Local físico (nível 1)
        Exemplos: "Loja principal" · "Filial Centro" · "Armazém externo"
        └── Área (nível 2)
              Exemplos: "Depósito" · "Câmara fria" · "Salão" · "Cozinha"
              └── Seção (nível 3)
                    Exemplos: "Prateleira A" · "Gôndola 3" · "Gaveta C" · "Mesa 7"
                    └── Posição (nível 4 — opcional)
                          Exemplos: "Nível 2" · "Lado esquerdo" · "Fundo"
```

> 💡 **Por que hierarquia recursiva com `pai_id`?**
> Alguns comércios precisam de 2 níveis (área > seção), outros de 4. Com uma tabela `locais_fisicos` auto-referenciada por `pai_id`, qualquer profundidade é suportada sem criar tabelas separadas para cada nível. O código percorre a árvore para montar o "caminho completo" do item.

### Exemplos por segmento

```
Mercado:
  Loja principal
    └── Depósito
          └── Prateleira B
                └── Nível 2          ← Arroz Tio João 5kg está aqui

Farmácia:
  Farmácia Centro
    └── Estoque refrigerado
          └── Gaveta C               ← Medicamentos termolábeis

Restaurante:
  Restaurante
    └── Cozinha
          └── Câmara fria
                └── Prateleira 1     ← Ingredientes pré-preparados
    └── Salão
          └── Mesa 7                 ← PDV e mapa de mesas

Padaria:
  Padaria
    └── Armazém seco
          └── Saco 3                 ← Farinha de trigo 50kg
    └── Vitrine quente
          └── Bandeja 2              ← Pão de queijo (produção do dia)
```

### Conexão com outros módulos

Quando uma entrada de estoque é registrada → funcionário informa o local físico onde o item foi alocado. Quando o estoque é consultado → sistema exibe o caminho completo do local. Quando o FEFO seleciona um lote para baixa → informa também onde esse lote está fisicamente. No PDV → funcionário vê onde buscar o item antes de entregar ao cliente.

---

## 🧱 Sistema de Composição de Itens (BOM Recursivo)

Todo item — produto, serviço, receita ou combo — segue a mesma estrutura. Um item pode ser composto por outros itens, de forma recursiva.

> 💡 Uma única tabela `items` com campo `tipo` permite composição entre qualquer tipo de item, elimina duplicação de lógica e simplifica consultas.

```
ITEM SIMPLES + ITEM COMPOSTO + SERVIÇO
          └──────── COMBO (agrupa qualquer mix, nome livre)

✅ Composição recursiva — combo pode conter combo
✅ Nome 100% livre
✅ Unidade de medida configurável (g, kg, ml, un, h, m²...)
✅ Custo calculado automaticamente (bottom-up)
✅ Recálculo em cascata ao atualizar custo de insumo
✅ Detecção e bloqueio de dependência circular (DFS)
```

### Exemplos

```
Pão de Hambúrguer (composto · rendimento 10un):
  500g farinha + 2 ovos + 10g sal + 15g fermento + 200ml leite
  Custo: R$ 0,32/un · Preço: R$ 0,80 · Margem: 150%

ServiçoCemzão (combo recursivo):
  → ServiçoCinquentão (outro combo)
  → Suporte premium 60 dias (serviço)
  → 2h consultoria (serviço)
  Preço: R$ 100,00
```

---

## 🏷️ Promoções e Precificação Dinâmica

> 💡 **Motor de precificação dinâmica.** O comerciante define a promoção uma vez, com regras de vigência e recorrência, e o sistema ativa e desativa automaticamente — sem intervenção manual em cada produto.

### Estrutura de uma Promoção

```
Promoção
  → Nome livre ("Quinta Verde" · "Black Friday" · "Queima de estoque")
  → Tipo de desconto:
      Percentual          (ex: 20% de desconto)
      Valor fixo          (ex: R$ 5,00 de desconto)
      Preço especial      (ex: de R$ 12,90 por R$ 8,90)
      Leve X Pague Y      (ex: leve 3 pague 2)
      Preço por peso      (ex: R$ 3,99/kg durante a promoção)
  → Vigência:
      Data/hora de início e fim
      Recorrência opcional:
        Toda quinta-feira
        Todo final de semana
        Primeiro dia do mês
        Diariamente das 14h às 17h (happy hour)
  → Itens elegíveis:
      Por código interno (seleção manual)
      Por categoria inteira (ex: toda a categoria "Frutas e Verduras")
      Por tag (ex: tag "promoção quinta")
      Por fornecedor (ex: todos os itens do fornecedor X)
  → Limite opcional:
      Quantidade máxima de unidades com desconto
      Limite por cliente
      Aplicar apenas no PDV · apenas online · em ambos
```

### Funcionamento automático

```
Sistema verifica vigência a cada consulta de preço
      ↓
Se promoção ativa: preço retornado = preço promocional
                   PDV exibe "De R$ X por R$ Y"
                   Cardápio QR exibe badge de promoção
                   Etiqueta de gôndola pode ser gerada automaticamente
      ↓
No vencimento da vigência: preço retorna ao original automaticamente
Sem nenhuma ação manual do comerciante
```

> 💡 **Por que verificar na consulta e não em um job?**
> Verificar a vigência no momento da consulta (campo calculado ou query com `WHERE NOW() BETWEEN inicio AND fim`) é mais confiável que um job agendado. Se o job falhar, os preços continuam errados. Na consulta, a regra é sempre aplicada em tempo real.

### Histórico e relatório de promoções

Cada promoção registra: quantas unidades foram vendidas com desconto, valor total descontado, impacto na margem. Isso permite ao comerciante medir se a "Quinta Verde" de fato aumentou o volume de vendas de frutas e verduras.

---

## 🖨️ Impressão de Etiquetas e Material de Oferta

> 💡 **O próprio sistema gera e imprime.** Sem precisar de Canva, Word ou qualquer programa externo. O comerciante seleciona o produto, escolhe o tipo de etiqueta, define a quantidade e manda imprimir direto da tela.

### Tipos de etiqueta e material

#### 1. Etiqueta de gôndola (amarela)
Aquela etiqueta grande que fica na prateleira do mercado com o preço em destaque.

```
Conteúdo:
  Nome do produto (fonte grande)
  Preço de venda (destaque máximo)
  Unidade (kg · un · cx · etc.)
  Se em promoção: "De R$ X,00" riscado + "Por R$ Y,00" em destaque
  Código de barras ou QR Code (opcional)
  Validade da promoção (se aplicável)

Formatos de saída:
  Impressora térmica de etiquetas (Zebra, Argox, Elgin) — formato ZPL
  Impressora comum — múltiplas etiquetas por folha A4
  PDF para download e impressão posterior

Configurações:
  Tamanho da etiqueta (cm × cm)
  Fonte e tamanho dos elementos
  Número de cópias
  Impressora de destino (configurada pelo comerciante)
```

#### 2. Etiqueta adesiva pequena (branca)
Cola na embalagem do produto. Usada em padarias, açougues, rotisserie e qualquer produto que seja pesado ou porcionado na hora.

```
Conteúdo:
  Nome do produto
  Código interno / código de barras
  Preço
  Peso / quantidade
  Data de validade (se aplicável)
  Lote (se aplicável)
  Nome do comércio (opcional)

Impressora: térmica de etiquetas (tipo Zebra ZD220, Argox OS-2140)
Formato: ZPL ou EPL
Tamanho padrão: 50mm × 25mm (configurável)
```

#### 3. Material de oferta para vitrine / parede
Cartaz impresso com design gerado automaticamente pelo sistema para divulgar promoções no ponto de venda.

```
Conteúdo:
  Nome do produto em destaque
  Imagem do produto (se cadastrada no sistema)
  Preço "De R$ X,00" (riscado, em vermelho)
  Preço "Por R$ Y,00" (grande, em destaque)
  Ou: "R$ X,00 o kg / a unidade / a dúzia"
  Período de validade da oferta
  Nome/logo do comércio
  Código QR (opcional, leva ao item no cardápio digital)

Tamanhos configuráveis:
  A4 · A5 · Meio A4 (folheto) · A3

Saída:
  PDF gerado no servidor (PDFKit ou Puppeteer)
  Download direto ou envio para impressora

Design:
  Template padrão do sistema (limpo, legível, profissional)
  Cores e logo configuráveis pelo comerciante nas configurações do comércio
```

### Fluxo de impressão

```
Comerciante/Funcionário abre módulo de Etiquetas
      ↓
Seleciona o item (busca por nome ou código interno)
      ↓
Escolhe o tipo: Gôndola · Adesiva · Material de oferta
      ↓
Sistema pré-preenche com os dados do item
  (nome, preço, promoção ativa se houver, validade do lote se configurado)
      ↓
Funcionário confere e ajusta se necessário
Define número de cópias
Seleciona impressora de destino
      ↓
Sistema gera ZPL (etiqueta) ou PDF (material de oferta)
Envia para impressora ou disponibiliza para download
```

### Configuração de impressoras

Cada comércio cadastra suas impressoras com nome livre:
```
"Etiquetadora caixa 1" → Zebra ZD220 · IP 192.168.1.50
"Impressora balcão"    → Argox OS-2140 · USB
"Impressora laser"     → HP LaserJet · IP 192.168.1.20
```

O sistema envia o trabalho de impressão via protocolo de impressora (IPP/LPR) ou exibe o PDF para o navegador abrir a caixa de impressão do sistema operacional.

---

## 🗂️ Mídia e Produtos Digitais

Qualquer item pode ter arquivos com dois modos de entrega:

```
uso = "apoio"  →  Gratuito, visível na página do item
uso = "venda"  →  Liberado após pagamento (presigned URLs · 72h)
```

| Tipo | Formatos | Tamanho máx |
|---|---|---|
| Imagem | JPG, PNG, WebP, GIF | 5 MB · até 10 |
| Vídeo | MP4, MOV, WebM ou URL YouTube/Vimeo | 500 MB |
| PDF | PDF | 50 MB |
| Planilha | XLSX, CSV | 100 MB |
| Texto | DOCX, TXT, MD | 100 MB |
| Slides | PPTX | 100 MB |
| Comprimido | ZIP | 100 MB |

---

## 🏭 Lote, Validade e Controle FEFO

> 💡 **FEFO = First Expired, First Out.** O produto que vence primeiro sai primeiro. O sistema informa não só qual lote usar, mas onde esse lote está fisicamente.

- Data de validade por item individual ou por lote/grupo
- Alertas configuráveis: 30, 15 e 7 dias antes do vencimento
- Relatório de itens próximos do vencimento e vencidos
- Localização física integrada ao lote — "Lote A · Câmara fria > Prateleira 1"

---

## 🏪 PDV e Movimento de Caixa

> 💡 Venda lançada no PDV já baixa estoque, já gera movimento de caixa, já emite fiscal e já registra a localização do item retirado.

PDVs com nomes livres por comércio: `"Caixa 1"` · `"Caixa Drive-thru"` · `"Balcão Cafeteria"`.

```
Abertura de caixa → valor inicial de troco
Durante o dia    → Vendas · Sangria · Suprimento · Devoluções
Fechamento       → Conferência por forma de pagamento · Diferença calculada
```

---

## 🧾 Emissão Fiscal

> 💡 XML SEFAZ gerado pelo sistema, transmitido via provedor (Focus NF-e, NFe.io, Enotas). Módulo local de simulação para desenvolvimento sem certificado digital.

| Documento | Quando |
|---|---|
| NFC-e | Venda no PDV para consumidor final |
| NF-e | Venda B2B ou online com nota |
| NF de Entrada | Recebimento de mercadoria |
| Nota Branca | Compras informais |

Material de oferta gerado por promoção já considera o preço promocional ativo no momento da impressão.

---

## 🔄 Procurement — Fluxo de Compras

```
Ordem de Orçamento → Pedido de Compra → Aprovação
→ Fornecedor confirma envio → Recebimento com NF ou nota branca
→ Lançamento em contas a pagar → Estoque atualizado com localização física e lote
```

---

## 👔 RH — Recursos Humanos

> 💡 Prontuário digital integrado ao cadastro de funcionário já existente no sistema. Cálculo automático de rescisão com geração de PDF para assinatura.

- Dados pessoais, contratuais e bancários
- Histórico funcional automático (mudanças de cargo, reajustes, advertências)
- Upload de documentos (currículo, atestados, contratos)
- Controle de férias
- Alertas de vencimento de exame médico e fim de contrato
- Simulação de rescisão com cálculo de todas as verbas trabalhistas
- Geração de Termo de Rescisão em PDF
- Upload do documento assinado → status "Rescindido" → acesso revogado automaticamente

> ⚠️ O cálculo de rescisão é uma estimativa. A homologação formal pode exigir sindicato dependendo da categoria.

---

## 🏭 Portal do Fornecedor

Fornecedor com usuário próprio no sistema:

```
Receber pedidos de compra · Responder orçamentos
Confirmar envio · Upload de XML NF-e · Histórico de transações
```

---

## 📋 Requisitos Funcionais (RF)

> 💡 **O que são RFs?** O que o sistema faz, da perspectiva do usuário, sem entrar em detalhes técnicos.

### Plataforma Geral

- **RF01** — Cadastro e login com roles: cliente, comerciante, funcionário, fornecedor, entregador, admin
- **RF02** — Autenticação via JWT + OAuth com refresh token
- **RF03** — Sistema de permissões granulares por recurso com perfis pré-definidos por nível
- **RF04** — Mapa de entregas com rastreamento em tempo real via gRPC
- **RF05** — Eventos assíncronos via Kafka
- **RF06** — E-mail de confirmação de pedido
- **RF07** — Alerta de estoque baixo
- **RF08** — Relatório diário de vendas
- **RF09** — Atendimento via WhatsApp com IA + escalonamento humano
- **RF10** — Suporte a múltiplos comércios (multi-tenant)

### Localização Física

- **RF11** — Cadastro de locais físicos do comércio com hierarquia recursiva e nomes livres
- **RF12** — Hierarquia flexível: o comerciante define quantos níveis precisar (mínimo 1, sem limite)
- **RF13** — Associação de item/lote a um local físico no momento da entrada de estoque
- **RF14** — Exibição do caminho completo do local na consulta de estoque e no FEFO
- **RF15** — No PDV, exibir localização do item para o operador saber onde buscar
- **RF16** — Relatório de inventário por local físico (o que está em cada área/seção)
- **RF17** — Transferência de item/lote entre locais físicos com registro de movimentação

### Composição de Itens (BOM)

- **RF18** — Item simples com nome livre e unidade de medida
- **RF19** — Item composto (receita/BOM) com componentes e quantidades
- **RF20** — Combo agrupando qualquer mix de itens
- **RF21** — Composição recursiva com detecção de dependência circular (DFS)
- **RF22** — Cálculo automático de custo bottom-up
- **RF23** — Margem bruta, líquida e preço sugerido automáticos
- **RF24** — Unidades de medida configuráveis
- **RF25** — Atributos variáveis via JSONB
- **RF26** — Baixa automática de insumos ao produzir ou vender
- **RF27** — Controle de rendimento de receita
- **RF28** — Registro de perda e desperdício

### Promoções e Precificação Dinâmica

- **RF29** — Cadastro de promoção com nome livre, tipo de desconto e vigência
- **RF30** — Tipos de desconto: percentual · valor fixo · preço especial · leve X pague Y · preço por peso
- **RF31** — Vigência por data/hora início e fim com ativação e desativação automáticas
- **RF32** — Recorrência: semanal (dias da semana), mensal (dia do mês), diária por horário (happy hour)
- **RF33** — Itens elegíveis por código interno, por categoria, por tag ou por fornecedor
- **RF34** — Limite opcional: quantidade máxima de unidades com desconto · limite por cliente
- **RF35** — Aplicação restrita a canal: somente PDV · somente online · ambos
- **RF36** — PDV e cardápio QR exibem preço promocional e badge de promoção automaticamente
- **RF37** — Histórico e relatório de promoções: unidades vendidas, desconto total, impacto na margem
- **RF38** — Promoção ativa integrada à geração de etiquetas e material de oferta

### Impressão de Etiquetas e Material de Oferta

- **RF39** — Geração de etiqueta de gôndola (amarela) com nome, preço, unidade, promoção e código de barras
- **RF40** — Geração de etiqueta adesiva pequena (branca) com nome, código, preço, peso, validade e lote
- **RF41** — Geração de material de oferta em PDF (A4/A5/A3) com design profissional gerado automaticamente
- **RF42** — Material de oferta inclui imagem do produto se cadastrada, preço "de/por", logo do comércio
- **RF43** — Configuração de número de cópias para impressão
- **RF44** — Cadastro de impressoras por comércio com nome livre, tipo (térmica/laser) e endereço (IP/USB)
- **RF45** — Seleção da impressora de destino no momento da impressão
- **RF46** — Saída em formato ZPL para impressoras térmicas de etiqueta
- **RF47** — Saída em PDF para impressoras comuns e laser
- **RF48** — Quando promoção está ativa, etiqueta e material de oferta são pré-preenchidos com preço de/por automaticamente
- **RF49** — Impressão em lote: selecionar múltiplos itens e gerar todas as etiquetas de uma vez

### Mídia e Produtos Digitais

- **RF50** — Até 10 imagens por item (JPG/PNG/WebP/GIF, máx 5 MB)
- **RF51** — Imagem de capa e reordenação de galeria
- **RF52** — Vídeo por upload ou URL (YouTube/Vimeo)
- **RF53** — PDF, planilha (XLSX, CSV), texto (DOCX, TXT), slides (PPTX), ZIP
- **RF54** — Modo de entrega: Apoio (gratuito) ou Venda (pós-pagamento, presigned URLs 72h)
- **RF55** — Área "Meus downloads" do cliente

### Lote, Validade e FEFO

- **RF56** — Data de validade por item individual ou por lote/grupo
- **RF57** — Código de lote por entrada de estoque
- **RF58** — FEFO automático na baixa de estoque com informação do local físico do lote
- **RF59** — Alertas de vencimento (30, 15 e 7 dias antes)
- **RF60** — Relatório de itens próximos do vencimento e vencidos por local físico

### Categorias e Impostos

- **RF61** — Categorias com nome livre
- **RF62** — Impostos em 3 níveis de herança (item → categoria → padrão do comércio)
- **RF63** — ICMS, PIS, COFINS, ISS, Simples Nacional e sem imposto
- **RF64** — Margem bruta e líquida exibidas separadamente
- **RF65** — Recálculo automático em cascata ao atualizar custo de insumo
- **RF66** — Alerta quando margem cair abaixo do mínimo

### Estoque e Fornecedores

- **RF67** — Cadastro de fornecedores
- **RF68** — Portal do fornecedor com acesso para receber pedidos e enviar NF
- **RF69** — Entrada de estoque via nota branca com localização física e lote
- **RF70** — Entrada de estoque via importação de XML NF-e com localização física e lote
- **RF71** — Histórico de compras por fornecedor e por item
- **RF72** — Estoque mínimo com alerta automático
- **RF73** — Sugestão de reposição por histórico de consumo

### Procurement

- **RF74** — Ordem de orçamento com solicitação ao fornecedor
- **RF75** — Pedido de compra com forma de pagamento
- **RF76** — Fluxo de aprovação por nível
- **RF77** — Portal do fornecedor para resposta e envio de NF
- **RF78** — Recebimento com conferência, localização física e lançamento de lote
- **RF79** — Contas a pagar automáticas

### PDV e Movimento de Caixa

- **RF80** — Múltiplos PDVs com nomes livres
- **RF81** — Vinculação de funcionários a PDVs e locais físicos específicos
- **RF82** — Abertura de caixa com valor inicial
- **RF83** — Sangria e suprimento com motivo
- **RF84** — Fechamento com conferência e relatório de diferença
- **RF85** — Histórico por PDV, operador e período
- **RF86** — No PDV, exibir preço promocional automaticamente se promoção ativa

### Emissão Fiscal

- **RF87** — NFC-e para PDV
- **RF88** — NF-e para B2B e online
- **RF89** — Importação de XML NF-e na entrada
- **RF90** — XML no padrão SEFAZ com integração a provedores (Focus NF-e, NFe.io, Enotas)
- **RF91** — Módulo local de simulação para desenvolvimento
- **RF92** — E-mail com XML e DANFE ao cliente
- **RF93** — Cancelamento de NF dentro do prazo legal

### RH

- **RF94** — Cadastro completo do funcionário
- **RF95** — Histórico funcional automático
- **RF96** — Upload de documentos no prontuário
- **RF97** — Controle de férias
- **RF98** — Alertas de RH (exame médico, fim de contrato)
- **RF99** — Dashboard com linha do tempo e indicadores
- **RF100** — Simulação de rescisão com cálculo automático
- **RF101** — Termo de Rescisão em PDF
- **RF102** — Upload do documento assinado e atualização de status

### Modo Restaurante

- **RF103** — Ativação automática por tipo de comerciante
- **RF104** — 1 a 3 métodos de atendimento simultâneos
- **RF105** — Mesas com localização física vinculada (área do salão)
- **RF106** — QR Code único por mesa
- **RF107** — Cardápio público via QR Code sem login com promoções ativas destacadas
- **RF108** — Comandas por mesa
- **RF109** — Painel do garçom com mapa visual por área
- **RF110** — Modo balcão com senha e painel de chamada
- **RF111** — Notificação de pedido pronto adaptada ao método ativo

---

## 🚫 Requisitos Não Funcionais (RNF)

> 💡 **O que são RNFs?** Como o sistema deve ser — performance, segurança, escalabilidade.

- **RNF01** — Infraestrutura em Docker
- **RNF02** — Backend modular por domínio
- **RNF03** — REST API como comunicação principal
- **RNF04** — gRPC para stream de localização
- **RNF05** — WebSocket/SSE para tempo real
- **RNF06** — TypeScript no frontend e backend
- **RNF07** — Código comentado para fins didáticos
- **RNF08** — Cardápio QR carrega em menos de 2s em 4G
- **RNF09** — BOM recursivo com detecção de loop (DFS)
- **RNF10** — Recálculo em cascata ao atualizar custo
- **RNF11** — Uploads com validação de tipo MIME e tamanho
- **RNF12** — Arquivos de Venda apenas via presigned URLs pós-pagamento
- **RNF13** — Permissões verificadas no middleware de cada rota, nunca só no frontend
- **RNF14** — XML fiscal validado contra schema SEFAZ antes de transmitir
- **RNF15** — RH acessível apenas por Dono e Gerente (nível 4+)
- **RNF16** — Cálculo de rescisão deve exibir aviso legal de estimativa
- **RNF17** — Movimentos de caixa não editáveis após fechamento
- **RNF18** — Vigência de promoção verificada na consulta de preço (não só em job agendado)
- **RNF19** — ZPL gerado deve ser testado contra impressoras Zebra/Argox antes de produção
- **RNF20** — PDF de material de oferta gerado em menos de 3 segundos
- **RNF21** — Hierarquia de locais físicos limitada a 6 níveis para evitar queries infinitas

---

## 🎨 Fase 2 — Design de Telas (Figma)

```
Briefing → Navigation Flow (FigJam) → Wireframe → Mockup de Alta Fidelidade
```

### Atores e Telas

| Ator | Estimativa |
|---|---|
| Cliente | 14 telas + Meus Downloads |
| Comércio / Dono | 25+ telas |
| Fornecedor (portal) | 6 telas |
| Entregador | 9 telas |
| Garçom | 6 telas |
| Admin | 7 telas |
| QR Code (público) | 6 telas |
| RH | 8 telas |
| PDV / Caixa | 5 telas |
| Promoções | 4 telas |
| Etiquetas | 3 telas |
| Localização física | 4 telas |

### Cores por Tipo de Tela

| Tipo | Hex | Quando usar |
|---|---|---|
| Formulário | `#8B5CF6` (roxo) | Login, Cadastro, Form. Item, RH, Configurações |
| Conteúdo | `#22C55E` (verde) | Página Produto, Prontuário, BOM, Relatório |
| Listagem | `#3B82F6` (azul) | Catálogos, Pedidos, Histórico, Localização |
| Fluxo / Status | `#EAB308` (amarelo) | Status Pedido, Rescisão, Procurement, Promoções |
| Dashboard | `#F97316` (laranja) | Dashboards, PDV em operação |
| Mapa / Tracking | `#EF4444` (vermelho) | Rastreamento, Mapa Entregas, Mapa de Locais |

## 🎨 Fase 2 — Design de Telas (Figma)

### Navigation Flow — MVP 1
![Briefing MVP 1](docs/briefing-mvp1.png)

> 🔗 Link do Figma: *(será adicionado após o design)*

---

## 🧩 Fase 3 — Modelagem UML

### Diagramas Previstos

| Diagrama | Ferramenta | Finalidade |
|---|---|---|
| **Casos de Uso** | Draw.io | O que cada ator pode fazer |
| **Diagrama de Classes** | Draw.io | Entidades e relacionamentos |
| **Diagrama de Sequência** | Draw.io | Fluxo de promoção ativa no PDV, localização física no FEFO, emissão fiscal, rescisão |
| **Diagrama de Componentes** | Draw.io | Como os módulos se comunicam |

> 🔗 Diagramas: *(serão adicionados no Draw.io)*

### Entidades Principais (prévia)

```
LocalFisico (hierarquia recursiva)
  - id, comercioId
  - paiId: int (null = raiz)    ← auto-referência para hierarquia livre
  - nome: String                ← livre: "Câmara fria", "Prateleira A", "Mesa 7"
  - tipo: String                ← livre: "area", "seccao", "posicao"
  - descricao: String
  + caminhoCompleto(): String   ← "Loja > Depósito > Prateleira A > Nível 2"

Promocao
  - id, comercioId
  - nome: String
  - tipo: Enum(percentual, valor_fixo, preco_especial, leve_x_pague_y, preco_peso)
  - valorDesconto, precoEspecial: Numeric
  - leveX, pagueY: int
  - dataInicio, dataFim: DateTime
  - recorrencia: JSONB          ← { tipo: "semanal", diasSemana: [4], horarioInicio, horarioFim }
  - canal: Enum(pdv, online, ambos)
  - limiteUnidades, limitePorCliente: int
  - ativo: boolean
  + estaAtiva(): boolean        ← verifica NOW() BETWEEN dataInicio AND dataFim
  + precoPromocional(precoOriginal): Numeric

PromocaoItem
  - promocaoId, itemId          ← item específico
  - promocaoId, categoriaId     ← categoria inteira
  - promocaoId, tag: String     ← por tag

Impressora
  - id, comercioId
  - nome: String                ← "Etiquetadora caixa 1"
  - tipo: Enum(termica, laser, jato_tinta)
  - protocolo: Enum(zpl, pdf, ipp, lpr)
  - endereco: String            ← IP ou "USB"

EtiquetaConfig
  - id, comercioId, tipo: Enum(gondola, adesiva, oferta)
  - larguraMm, alturaMm
  - template: JSONB             ← posições e tamanhos dos elementos
  - impressoraId

Item
  - id, comercioId, nome, tipo, unidadeMedida
  - precoVenda, custoCalculado, margemBruta (GENERATED)
  - impostos: JSONB, attributes: JSONB
  - estoque, estoqueMinimo
  + precoAtual(): Numeric       ← retorna promocional se promoção ativa, senão precoVenda

ItemLote
  - itemId, localFisicoId       ← onde este lote está fisicamente
  - codigoLote, dataValidade
  - quantidade

FuncionarioRH
  - funcionarioId, tipoContrato, dataAdmissao
  - cargoAtual, salarioAtual, status
  + calcularRescisao(tipo, data): SimulacaoRescisao
  + gerarTermoRescisao(): PDF

EmissaoFiscal
  - pedidoId, pdvId, tipo: Enum(nfce, nfe)
  - xml, chaveAcesso, danfePdfUrl
  - status: Enum(pendente, autorizada, cancelada)
  + transmitir(): void
```

---

## 🏗️ Fase 4 — Arquitetura C4

### Nível 1 — Contexto

```
┌──────────────────────────────────────────────────────────────────────┐
│  Clientes ──────────────────────────────────────────► [Sistema]      │
│  Comerciantes / Funcionários ───────────────────────► [Sistema]      │
│  Fornecedores (portal) ─────────────────────────────► [Sistema]      │
│  Entregadores ──────────────────────────────────────► [Sistema]      │
│  Clientes via QR Code (sem login) ──────────────────► [Sistema]      │
│  Administradores ───────────────────────────────────► [Sistema]      │
│                                                                      │
│  [Sistema] ──► WhatsApp + IA (n8n)                                   │
│  [Sistema] ──► E-mail (n8n)                                          │
│  [Sistema] ──► Storage S3/local (mídia e documentos)                 │
│  [Sistema] ──► Provedor Fiscal (Focus NF-e / NFe.io / Enotas)        │
│  [Sistema] ──► Impressoras (ZPL via rede ou PDF via browser)         │
└──────────────────────────────────────────────────────────────────────┘
```

### Nível 2 — Containers

```
┌──────────────────────────────────────────────────────────────────────┐
│  [React Frontend] ── REST ──► [Nginx] ──► [Backend Node.js]          │
│  [PDV Web/App] ───── REST ──► [Nginx] ──► [Backend Node.js]          │
│  [Portal Fornecedor] REST ──► [Nginx] ──► [Backend Node.js]          │
│  [Cardápio QR PWA] ── REST ──► [Nginx] ──► [Backend Node.js]         │
│                                                  │                   │
│                       gRPC (localização GPS)     │                   │
│  [Mapa Entregas] ◄───────────────────────────────┘                   │
│                       WebSocket/SSE              │                   │
│  [Painel Garçom/PDV] ◄───────────────────────────┘                   │
│                       Mídia e documentos         │                   │
│  [Storage S3/local] ◄────────────────────────────┘                   │
│                       XML fiscal                 │                   │
│  [Provedor Fiscal] ◄─────────────────────────────┘                   │
│                       ZPL/PDF impressão          │                   │
│  [Impressoras] ◄─────────────────────────────────┘                   │
│                          ┌───────────────────────┴──────────────┐    │
│                          │ PostgreSQL 16 · Redis · Kafka         │    │
│                          └───────────────────────────────────────┘    │
│  [n8n] ◄── Kafka ── [Backend]                                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Por quê |
|---|---|---|
| Frontend | React + TypeScript | Componentização, tipagem estática |
| PDV | React PWA (instalável) | Funciona offline, sem app store |
| Portal Fornecedor | React (sub-app) | Contexto isolado de permissões |
| Cardápio QR | React PWA (público) | Sem app instalado |
| Backend | Node.js + Express + TypeScript | Performance para I/O |
| Comunicação principal | REST API | Padrão universal |
| Localização GPS em tempo real | gRPC | Stream eficiente |
| Notificações em tempo real | WebSocket / SSE | Baixa latência |
| Mensageria | Apache Kafka | Desacopla eventos |
| Banco de Dados | PostgreSQL 16 (JSONB) | Atributos flexíveis + índices |
| Cache / Sessão | Redis | Sub-milissegundo + tokens |
| Autenticação | JWT + OAuth | Stateless, multi-role |
| Storage de arquivos | S3 ou storage local | Arquivos fora do banco |
| Emissão Fiscal | Focus NF-e / NFe.io / Enotas | API REST, sem certificado no servidor |
| Geração de PDF | PDFKit ou Puppeteer | Rescisão, DANFE, material de oferta |
| Geração de ZPL | ZPL.js ou template manual | Etiquetas para impressoras térmicas |
| Motor de promoções | Lógica própria no backend | Verificação na consulta de preço |
| Automações | n8n | Visual, sem deploy de código |
| Atendimento IA | n8n + Gemini/GPT + WhatsApp | 24h com escalonamento humano |
| Proxy | Nginx | Um ponto de entrada |
| Infraestrutura | Docker + Docker Compose | Ambiente reproduzível |
| Design | Figma + FigJam | Standard da indústria |
| Modelagem | Draw.io (UML + C4) | Gratuito |

---

## 🤖 Automações com n8n

> 💡 Automações mudam com frequência. O n8n permite ajustar sem deploy de código.

| # | Gatilho | Ação |
|---|---|---|
| 1 | `pedido.criado` (Kafka) | E-mail de confirmação ao cliente |
| 2 | `item.estoque_baixo` (Kafka) | E-mail/Telegram ao responsável |
| 3 | Schedule diário | Alerta de validade próxima (30/15/7 dias) |
| 4 | `item.custo_atualizado` (Kafka) | Recálculo em cascata + alerta de margem |
| 5 | `pedido.pago` (Kafka) | Entrega de produto digital (presigned URLs) |
| 6 | `pedido_compra.aprovado` (Kafka) | Notificação ao fornecedor no portal |
| 7 | Schedule diário | Alertas de RH (exame médico, fim de contrato) |
| 8 | `promocao.iniciando` (Kafka) | Notificação ao comerciante + opcional e-mail aos clientes |
| 9 | `pedido.pronto` (Kafka) | Notificação por método (QR · Balcão · Garçom) |
| 10 | Schedule 08:00 | Relatório diário de vendas |
| 11 | WhatsApp mensagem | IA responde + escalonamento humano |

---

## 📋 Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20+](https://nodejs.org/)
- [pgAdmin 4](https://www.pgadmin.org/download/pgadmin-4-windows/)
- [Figma](https://figma.com/) + [FigJam](https://figma.com/figjam/)
- [Draw.io](https://app.diagrams.net/)

---

## 🖥️ Requisitos de Hardware

> 💡 Este sistema roda inteiramente em Docker. Os perfis abaixo consideram todos os containers ativos simultaneamente: PostgreSQL, Redis, Kafka, Zookeeper, n8n, Nginx, backend e frontend. O perfil **servidor de comércio** é para uso em produção em um estabelecimento. O perfil **desenvolvedor** é para rodar o ambiente completo localmente com hot-reload, ferramentas de debug e múltiplas abas abertas.

### 🏪 Perfil 1 — Servidor de Comércio (produção local)

Máquina dedicada instalada no estabelecimento para servir o sistema para o próprio comércio. Não precisa ser poderosa — os containers do sistema são leves quando o tráfego é de um único comércio.

#### Processadores Intel recomendados

| Categoria | Modelos | Observação |
|---|---|---|
| **Mínimo viável** | Core i3-10100, i3-12100, i3-N305 (NUC) | 4 núcleos · suficiente para até 3 PDVs simultâneos |
| **Recomendado** | Core i5-10400, i5-12400, i5-13400 | 6 núcleos · confortável para movimento intenso |
| **Confortável** | Core i5-12500, i5-13500, i7-12700 | Margem para crescimento e módulos futuros |
| **Processadores de servidor** | Xeon E-2300 series, Xeon E3-1200 v6 | Para quem quer estabilidade 24/7 com ECC RAM |

#### Processadores AMD recomendados

| Categoria | Modelos | Observação |
|---|---|---|
| **Mínimo viável** | Ryzen 3 4100, Ryzen 3 5300G | 4 núcleos · econômico e eficiente |
| **Recomendado** | Ryzen 5 5600, Ryzen 5 5600G, Ryzen 5 7600 | 6 núcleos · ótimo custo-benefício |
| **Confortável** | Ryzen 5 7600X, Ryzen 7 5700X, Ryzen 7 7700 | Margem ampla para expansão |
| **Processadores de servidor** | EPYC 3000 series, Ryzen Embedded V2000 | Para operações críticas 24/7 |

#### Memória RAM — Servidor de Comércio

| Configuração | RAM | Quando usar |
|---|---|---|
| **Mínimo absoluto** | 8 GB DDR4 | Comércio pequeno, poucos PDVs, sem IA local |
| **Recomendado** | 16 GB DDR4 | A maioria dos comércios — margem confortável |
| **Ideal** | 32 GB DDR4/DDR5 | Comércio grande, múltiplos PDVs, crescimento |

> 💡 Docker com todos os containers consome entre 3 GB e 6 GB de RAM em uso normal. Com 8 GB o sistema roda, mas o sistema operacional fica apertado. Com 16 GB há folga segura.

#### Armazenamento — Servidor de Comércio

| Tipo | Capacidade mínima | Observação |
|---|---|---|
| **SSD SATA ou NVMe** | 120 GB | Mínimo para OS + Docker + banco |
| **Recomendado** | 240 GB SSD | Espaço para crescimento do banco e uploads |
| **Ideal** | 480 GB SSD + HD externo para backup | Backup automático diário dos volumes Docker |

> ⚠️ **Nunca use HD mecânico (HDD) como disco principal.** PostgreSQL e Docker têm I/O intenso — um HDD torna o sistema lento mesmo com bom processador. SSD é requisito, não opcional.

#### Rede — Servidor de Comércio

- Conexão cabeada (cabo de rede) obrigatória — Wi-Fi para servidor não é recomendado
- IP fixo na rede local (configurar no roteador por MAC address)
- Internet: mínimo 10 Mbps simétrico para sincronização do n8n, emissão fiscal e atualizações

#### Formulário de servidor compacto (mini PC) — opção econômica

Mini PCs são ideais para servidor de comércio: consomem pouca energia, são silenciosos, pequenos e têm desempenho suficiente.

```
Opções recomendadas (2024/2025):
  Intel NUC 12/13 com Core i3 ou i5
  Beelink Mini S12 Pro (Intel N100 · 16 GB RAM · 500 GB SSD) ← ótimo custo-benefício
  Minisforum UM560 XT (AMD Ryzen 5 5625U · 16 GB · 512 GB SSD)
  ACEMAGIC S1 (Intel N97 · 16 GB · 512 GB SSD)

Consumo de energia médio: 15W–35W (muito mais econômico que desktop)
```

---

### 💻 Perfil 2 — Máquina do Desenvolvedor

O desenvolvedor roda o ambiente completo localmente com Docker Desktop, editor de código (VS Code), navegador com múltiplas abas de debug, ferramentas de banco (pgAdmin, DBeaver), Kafka UI, Postman/Insomnia e opcionalmente o Figma rodando junto.

#### Processadores Intel — Desenvolvimento

| Categoria | Modelos | Observação |
|---|---|---|
| **Mínimo funcional** | Core i5-10400, i5-11400 | 6 núcleos · build lento, mas funcional |
| **Recomendado** | Core i5-12600K, i5-13600K, i7-12700 | 10–12 núcleos · build rápido, Docker fluido |
| **Confortável** | Core i7-13700K, i9-12900, i7-14700 | 16–20 núcleos · tudo simultâneo sem travar |
| **Laptop** | Core i5-1240P, i7-1260P, i7-1355U (12ª/13ª gen) | P-series tem boa performance térmica |

#### Processadores AMD — Desenvolvimento

| Categoria | Modelos | Observação |
|---|---|---|
| **Mínimo funcional** | Ryzen 5 5600, Ryzen 5 5600X | 6 núcleos · boa relação preço/desempenho |
| **Recomendado** | Ryzen 7 5700X, Ryzen 7 7700X, Ryzen 5 7600X | 6–8 núcleos · excelente para Docker + build |
| **Confortável** | Ryzen 9 7900X, Ryzen 9 5900X | 12 núcleos · sem compromisso |
| **Laptop** | Ryzen 7 7745HX, Ryzen 5 7640HS, Ryzen 7 7840U | Série H para performance, U para bateria |

#### Memória RAM — Desenvolvedor

| Configuração | RAM | Quando usar |
|---|---|---|
| **Mínimo absoluto** | 16 GB DDR4 | Funciona, mas vai travar com tudo aberto |
| **Recomendado** | 32 GB DDR4/DDR5 | Confortável para Docker + IDE + navegador |
| **Ideal** | 64 GB DDR4/DDR5 | Sem limitação — múltiplos projetos simultâneos |

> 💡 Docker Desktop no Windows/macOS usa uma VM Linux por baixo. Essa VM precisa de memória reservada. Com 16 GB o Docker fica apertado quando a IDE e o navegador também estão abertos. **32 GB é o ponto ideal para desenvolver neste projeto.**

#### Armazenamento — Desenvolvedor

| Tipo | Capacidade | Observação |
|---|---|---|
| **Mínimo** | 256 GB NVMe SSD | Apertado se tiver outros projetos |
| **Recomendado** | 512 GB NVMe SSD | Confortável |
| **Ideal** | 1 TB NVMe SSD | Sem preocupação com espaço |

> 💡 NVMe é fortemente recomendado para desenvolvimento. O `docker-compose up --build` envolve muita leitura/escrita de camadas de imagem. Um NVMe Gen 3 é 5× mais rápido que um SATA SSD e faz diferença real no tempo de build.

---

### 🐧 Sistemas Operacionais

#### Para o servidor de comércio (produção)

| Sistema | Versão | Por quê |
|---|---|---|
| **Ubuntu Server** | 22.04 LTS (Jammy) | Mais suporte da comunidade Docker, LTS até 2027 |
| **Ubuntu Server** | 24.04 LTS (Noble) | Mais recente, LTS até 2029 |
| **Debian** | 12 (Bookworm) | Extremamente estável, baixo consumo de RAM |
| **Rocky Linux** | 9 | Alternativa ao CentOS, ótimo para produção |
| **AlmaLinux** | 9 | Outra alternativa CentOS, certificado para Docker |

> ✅ **Recomendação para servidor de comércio:** Ubuntu Server 22.04 LTS com instalação mínima (sem interface gráfica). Usa entre 300 MB e 500 MB de RAM apenas com o SO, deixando máximo para os containers.

#### Para a máquina do desenvolvedor

| Sistema | Versão | Configuração Docker |
|---|---|---|
| **Windows 11** | 22H2 ou superior | Docker Desktop + WSL2 (Ubuntu 22.04 no WSL) |
| **Windows 10** | 21H2 ou superior | Docker Desktop + WSL2 |
| **Ubuntu Desktop** | 22.04 ou 24.04 LTS | Docker Engine nativo (mais leve que Desktop) |
| **Fedora** | 38/39/40 | Docker Engine ou Podman (compatível) |
| **macOS** | Ventura (13) ou Sonoma (14) | Docker Desktop para Mac (Apple Silicon ou Intel) |
| **Pop!_OS** | 22.04 | Docker Engine nativo, ótimo para devs |

> ✅ **Recomendação para desenvolvedor Windows:** Windows 11 + WSL2 com Ubuntu 22.04. Instale o Docker Desktop apontando para o WSL2 — performance muito melhor que Hyper-V puro. Configure no `.wslconfig` a memória máxima da VM.

```ini
# %USERPROFILE%\.wslconfig  (Windows — limitar e otimizar WSL2)
[wsl2]
memory=12GB        # ajuste conforme sua RAM total
processors=6       # ajuste conforme seus núcleos
swap=4GB
localhostForwarding=true
```

> ✅ **Recomendação para desenvolvedor macOS Apple Silicon (M1/M2/M3):** Docker Desktop com Rosetta 2 habilitado. Este projeto usa imagens `linux/amd64` — o Docker faz a emulação automaticamente, mas pode ser ligeiramente mais lento em containers com muita CPU.

---

### 📊 Resumo — Configurações Mínimas e Recomendadas

```
┌─────────────────────────────────────────────────────────────────────┐
│  SERVIDOR DE COMÉRCIO (produção local)                              │
│                                                                     │
│  Mínimo:      i3-10100 / Ryzen 3 4100 · 8 GB RAM · SSD 120 GB      │
│  Recomendado: i5-12400 / Ryzen 5 5600 · 16 GB RAM · SSD 240 GB     │
│  Ideal:       i5-13500 / Ryzen 5 7600 · 32 GB RAM · SSD 480 GB     │
│  SO:          Ubuntu Server 22.04 LTS (sem interface gráfica)       │
│  Rede:        Cabo · IP fixo local · 10 Mbps internet               │
│  Forma fator: Mini PC ou desktop compacto                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  MÁQUINA DO DESENVOLVEDOR                                           │
│                                                                     │
│  Mínimo:      i5-10400 / Ryzen 5 5600 · 16 GB RAM · SSD 256 GB     │
│  Recomendado: i7-12700 / Ryzen 7 5700X · 32 GB RAM · NVMe 512 GB   │
│  Ideal:       i9-13900 / Ryzen 9 7900X · 64 GB RAM · NVMe 1 TB     │
│  SO:          Windows 11 + WSL2 / Ubuntu 22.04 / macOS Ventura+     │
│  Extras:      Monitor ≥ 24" · segundo monitor recomendado           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Como Rodar o Projeto

```bash
git clone https://github.com/seu-usuario/project-market-system.git
cd project-market-system
docker-compose up -d        # sobe tudo
docker ps                   # verifica containers
docker-compose up -d postgres redis   # só banco e cache
```

---

## 🌐 Endereços dos Serviços

| Serviço | URL | Descrição |
|---|---|---|
| Frontend | `http://localhost` | Interface React principal |
| Backend API | `http://localhost/api` | REST API Node.js |
| Cardápio QR | `http://localhost/cardapio/{slug}/mesa/{num}` | Público |
| Portal Fornecedor | `http://localhost/fornecedor` | Parceiros |
| n8n | `http://localhost:5678` | Automações |
| pgAdmin | `localhost:5432` | Banco de dados |

---

## 🐳 Arquitetura de Containers

```
Docker
├── nginx     → Porta 80 — roteia todos os serviços
├── frontend  → React (porta 3000)
├── backend   → Node.js (4000) + gRPC (50051) + WS (4001)
├── postgres  → PostgreSQL (5432)
├── redis     → Cache e JWT (6379)
├── n8n       → Automações (5678)
├── zookeeper → Gerenciador do Kafka
└── kafka     → Mensageria (9092 interna)
```

---

## 🗄️ Banco de Dados

### Conexão (pgAdmin)

| Campo | Valor |
|---|---|
| Host | `localhost` |
| Porta | `5432` |
| Banco | `market_db` |
| Usuário | `market_user` |
| Senha | `market_pass` |

### Tabelas Principais

```sql
-- Hierarquia recursiva de locais físicos
-- pai_id = NULL significa raiz (nível 1)
CREATE TABLE locais_fisicos (
    id          SERIAL PRIMARY KEY,
    comercio_id INTEGER NOT NULL REFERENCES comercios(id),
    pai_id      INTEGER REFERENCES locais_fisicos(id),  -- auto-referência
    nome        VARCHAR(150) NOT NULL,
    tipo        VARCHAR(80),                             -- livre: "area", "seccao", "posicao"
    descricao   TEXT,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE
);

-- Item universal
CREATE TABLE items (
    id               SERIAL PRIMARY KEY,
    comercio_id      INTEGER NOT NULL REFERENCES comercios(id),
    categoria_id     INTEGER REFERENCES categorias(id),
    nome             VARCHAR(200) NOT NULL,
    descricao        TEXT,
    tipo             VARCHAR(20) NOT NULL
                     CHECK (tipo IN ('simples','composto','servico','combo')),
    unidade_medida   VARCHAR(20) NOT NULL DEFAULT 'un',
    preco_venda      NUMERIC(12,4) NOT NULL DEFAULT 0,
    custo_calculado  NUMERIC(12,4) NOT NULL DEFAULT 0,
    margem_bruta     NUMERIC(6,2) GENERATED ALWAYS AS (
                       CASE WHEN preco_venda > 0
                       THEN ROUND(((preco_venda - custo_calculado) / preco_venda) * 100, 2)
                       ELSE 0 END
                     ) STORED,
    impostos         JSONB NOT NULL DEFAULT '{}',
    attributes       JSONB NOT NULL DEFAULT '{}',
    estoque          NUMERIC(12,4) NOT NULL DEFAULT 0,
    estoque_minimo   NUMERIC(12,4) NOT NULL DEFAULT 0,
    rendimento       NUMERIC(12,4) DEFAULT 1,
    rendimento_un    VARCHAR(20) DEFAULT 'un',
    ativo            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Lotes com localização física
CREATE TABLE item_lotes (
    id               SERIAL PRIMARY KEY,
    item_id          INTEGER NOT NULL REFERENCES items(id),
    local_fisico_id  INTEGER REFERENCES locais_fisicos(id),  -- onde está
    codigo_lote      VARCHAR(100),
    data_fabricacao  DATE,
    data_validade    DATE,
    quantidade       NUMERIC(12,4) NOT NULL DEFAULT 0,
    entrada_id       INTEGER REFERENCES entradas_estoque(id)
);

-- Promoções com motor de vigência e recorrência
CREATE TABLE promocoes (
    id                   SERIAL PRIMARY KEY,
    comercio_id          INTEGER NOT NULL REFERENCES comercios(id),
    nome                 VARCHAR(200) NOT NULL,
    tipo                 VARCHAR(20) NOT NULL
                         CHECK (tipo IN ('percentual','valor_fixo','preco_especial',
                                         'leve_x_pague_y','preco_peso')),
    valor_desconto       NUMERIC(12,4),   -- percentual ou valor fixo
    preco_especial       NUMERIC(12,4),   -- para tipo preco_especial
    leve_x               INTEGER,         -- para tipo leve_x_pague_y
    pague_y              INTEGER,
    data_inicio          TIMESTAMP NOT NULL,
    data_fim             TIMESTAMP NOT NULL,
    recorrencia          JSONB DEFAULT NULL,
                         -- { tipo: "semanal", diasSemana: [4], horarioInicio: "00:00", horarioFim: "23:59" }
    canal                VARCHAR(10) NOT NULL DEFAULT 'ambos'
                         CHECK (canal IN ('pdv','online','ambos')),
    limite_unidades      INTEGER,
    limite_por_cliente   INTEGER,
    ativo                BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Itens elegíveis para cada promoção (pode ser por item, categoria ou tag)
CREATE TABLE promocao_itens (
    id           SERIAL PRIMARY KEY,
    promocao_id  INTEGER NOT NULL REFERENCES promocoes(id),
    item_id      INTEGER REFERENCES items(id),
    categoria_id INTEGER REFERENCES categorias(id),
    tag          VARCHAR(100),
    CHECK (
        (item_id IS NOT NULL AND categoria_id IS NULL AND tag IS NULL) OR
        (item_id IS NULL AND categoria_id IS NOT NULL AND tag IS NULL) OR
        (item_id IS NULL AND categoria_id IS NULL AND tag IS NOT NULL)
    )
);

-- Impressoras cadastradas por comércio
CREATE TABLE impressoras (
    id          SERIAL PRIMARY KEY,
    comercio_id INTEGER NOT NULL REFERENCES comercios(id),
    nome        VARCHAR(150) NOT NULL,
    tipo        VARCHAR(20) NOT NULL CHECK (tipo IN ('termica','laser','jato_tinta')),
    protocolo   VARCHAR(10) NOT NULL CHECK (protocolo IN ('zpl','pdf','ipp','lpr')),
    endereco    VARCHAR(200) NOT NULL,   -- IP:porta ou "USB"
    ativo       BOOLEAN NOT NULL DEFAULT TRUE
);

-- Configuração de templates de etiqueta
CREATE TABLE etiqueta_configs (
    id            SERIAL PRIMARY KEY,
    comercio_id   INTEGER NOT NULL REFERENCES comercios(id),
    tipo          VARCHAR(20) NOT NULL CHECK (tipo IN ('gondola','adesiva','oferta')),
    largura_mm    NUMERIC(6,2) NOT NULL,
    altura_mm     NUMERIC(6,2) NOT NULL,
    impressora_id INTEGER REFERENCES impressoras(id),
    template      JSONB NOT NULL DEFAULT '{}'  -- posições e tamanhos dos elementos
);

-- Usuários (base para todos os atores)
CREATE TABLE users (
    id         SERIAL PRIMARY KEY,
    nome       VARCHAR(200) NOT NULL,
    email      VARCHAR(200) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    role       VARCHAR(20) NOT NULL
               CHECK (role IN ('cliente','comerciante','funcionario','fornecedor','entregador','admin')),
    ativo      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Funcionários com permissões
CREATE TABLE funcionarios (
    id                       SERIAL PRIMARY KEY,
    user_id                  INTEGER NOT NULL REFERENCES users(id),
    comercio_id              INTEGER NOT NULL REFERENCES comercios(id),
    perfil                   VARCHAR(20) NOT NULL
                             CHECK (perfil IN ('dono','gerente','estoque','caixa','garcom')),
    permissoes_customizadas  JSONB NOT NULL DEFAULT '{}',
    pdvs_vinculados          INTEGER[] DEFAULT '{}',
    locais_vinculados        INTEGER[] DEFAULT '{}',   -- locais físicos que pode acessar
    ativo                    BOOLEAN NOT NULL DEFAULT TRUE
);

-- RH — dados trabalhistas
CREATE TABLE funcionarios_rh (
    id               SERIAL PRIMARY KEY,
    funcionario_id   INTEGER NOT NULL REFERENCES funcionarios(id),
    tipo_contrato    VARCHAR(20) NOT NULL CHECK (tipo_contrato IN ('clt','pj','temporario','estagio')),
    data_admissao    DATE NOT NULL,
    data_demissao    DATE,
    cargo_atual      VARCHAR(150) NOT NULL,
    salario_atual    NUMERIC(12,2) NOT NULL,
    jornada_horas    NUMERIC(4,1) DEFAULT 44,
    dados_bancarios  JSONB DEFAULT '{}',
    status           VARCHAR(20) NOT NULL DEFAULT 'ativo'
                     CHECK (status IN ('ativo','rescindido','afastado','ferias'))
);

-- Histórico funcional (linha do tempo automática)
CREATE TABLE historico_funcional (
    id              SERIAL PRIMARY KEY,
    funcionario_id  INTEGER NOT NULL REFERENCES funcionarios(id),
    tipo            VARCHAR(30) NOT NULL
                    CHECK (tipo IN ('admissao','mudanca_cargo','reajuste','advertencia',
                                    'afastamento','promocao','rescisao','ferias')),
    data_evento     DATE NOT NULL DEFAULT CURRENT_DATE,
    descricao       TEXT,
    valor_anterior  VARCHAR(300),
    valor_novo      VARCHAR(300),
    documento_url   TEXT,
    registrado_por  INTEGER REFERENCES users(id)
);

-- PDVs
CREATE TABLE pdvs (
    id           SERIAL PRIMARY KEY,
    comercio_id  INTEGER NOT NULL REFERENCES comercios(id),
    nome         VARCHAR(150) NOT NULL,
    local_id     INTEGER REFERENCES locais_fisicos(id),  -- onde o PDV está
    ativo        BOOLEAN NOT NULL DEFAULT TRUE
);

-- Movimentos de caixa
CREATE TABLE movimentos_caixa (
    id                SERIAL PRIMARY KEY,
    pdv_id            INTEGER NOT NULL REFERENCES pdvs(id),
    operador_id       INTEGER NOT NULL REFERENCES funcionarios(id),
    data_abertura     TIMESTAMP NOT NULL DEFAULT NOW(),
    data_fechamento   TIMESTAMP,
    valor_inicial     NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_vendas      NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_sangria     NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_suprimento  NUMERIC(12,2) NOT NULL DEFAULT 0,
    valor_informado   NUMERIC(12,2),
    diferenca         NUMERIC(12,2),
    status            VARCHAR(10) NOT NULL DEFAULT 'aberto'
                      CHECK (status IN ('aberto','fechado'))
);

-- Emissões fiscais
CREATE TABLE emissoes_fiscais (
    id            SERIAL PRIMARY KEY,
    pedido_id     INTEGER REFERENCES orders(id),
    pdv_id        INTEGER REFERENCES pdvs(id),
    tipo          VARCHAR(10) NOT NULL CHECK (tipo IN ('nfce','nfe')),
    xml           TEXT,
    chave_acesso  VARCHAR(50),
    danfe_url     TEXT,
    status        VARCHAR(20) NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente','autorizada','cancelada','rejeitada')),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Comércios
CREATE TABLE comercios (
    id                   SERIAL PRIMARY KEY,
    user_id              INTEGER NOT NULL REFERENCES users(id),
    nome                 VARCHAR(200) NOT NULL,
    tipo                 VARCHAR(50) NOT NULL,
    segmento             VARCHAR(200),
    cnpj                 VARCHAR(20),
    regime_tributario    VARCHAR(30),
    logo_url             TEXT,
    cores_config         JSONB DEFAULT '{}',   -- cores para material de oferta
    modo_restaurante     BOOLEAN DEFAULT FALSE,
    metodos_atendimento  JSONB DEFAULT '{"garcom":false,"qrcode":false,"balcao":false}',
    imposto_padrao       JSONB DEFAULT '{}',
    config_fiscal        JSONB DEFAULT '{}',
    created_at           TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 📁 Estrutura do Projeto

```
project-market-system/
├── docker-compose.yml
├── README.md
├── nginx/nginx.conf
├── backend/
│   ├── Dockerfile
│   └── src/
│       ├── modules/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── funcionarios/
│       │   ├── rh/                          # Prontuário, rescisão, alertas
│       │   │   └── rescisao.calculator.ts
│       │   ├── permissoes/                  # Middleware granular por rota
│       │   ├── locais-fisicos/              # Hierarquia recursiva de locais
│       │   │   ├── local.model.ts
│       │   │   ├── local.service.ts         # caminhoCompleto(), transferirLote()
│       │   │   └── local.routes.ts
│       │   ├── promocoes/                   # Motor de promoções
│       │   │   ├── promocao.model.ts
│       │   │   ├── promocao.service.ts      # estaAtiva(), precoPromocional()
│       │   │   ├── promocao.scheduler.ts    # Job para eventos Kafka
│       │   │   └── promocao.routes.ts
│       │   ├── etiquetas/                   # Impressão de etiquetas e oferta
│       │   │   ├── etiqueta.service.ts      # Geração ZPL e PDF
│       │   │   ├── zpl.generator.ts         # Montagem de ZPL por template
│       │   │   ├── oferta.generator.ts      # PDF de material de oferta
│       │   │   └── etiqueta.routes.ts
│       │   ├── pdv/
│       │   ├── fiscal/
│       │   ├── procurement/
│       │   ├── fornecedores/
│       │   ├── comercios/
│       │   ├── categorias/
│       │   ├── items/
│       │   ├── midia/
│       │   ├── componentes/
│       │   ├── estoque/
│       │   ├── impostos/
│       │   ├── orders/
│       │   ├── deliveries/
│       │   │   └── delivery.grpc.ts
│       │   └── restaurant/
│       │       └── mesa.gateway.ts
│       └── shared/
│           ├── middlewares/
│           │   ├── auth.middleware.ts
│           │   └── permissao.middleware.ts
│           ├── database/connection.ts
│           ├── redis/redis.client.ts
│           ├── kafka/producer.ts + consumer.ts
│           ├── grpc/server.ts
│           ├── storage/storage.client.ts
│           ├── pdf/pdf.generator.ts
│           └── errors/AppError.ts
└── frontend/
    └── src/
        ├── modules/
        │   ├── auth/
        │   ├── items/
        │   ├── locais-fisicos/              # Mapa/árvore de locais, vinculação de lotes
        │   │   ├── LocalFisicoTreePage.tsx
        │   │   └── LocalFisicoFormPage.tsx
        │   ├── promocoes/                   # Motor de promoções
        │   │   ├── PromocaoListPage.tsx
        │   │   ├── PromocaoFormPage.tsx
        │   │   └── PromocaoDashboardPage.tsx
        │   ├── etiquetas/                   # Seleção e impressão
        │   │   ├── EtiquetaSelectorPage.tsx
        │   │   ├── EtiquetaPreviewPage.tsx
        │   │   └── ImpresoraConfigPage.tsx
        │   ├── rh/
        │   ├── pdv/
        │   ├── procurement/
        │   ├── fiscal/
        │   ├── estoque/
        │   ├── downloads/
        │   ├── deliveries/
        │   └── restaurant/
        ├── portals/
        │   └── fornecedor/
        ├── cardapio-qr/
        └── shared/
            ├── components/
            │   ├── Button.tsx
            │   ├── Input.tsx
            │   ├── Badge.tsx
            │   ├── FileUploadZone.tsx
            │   └── LocalFisicoSelector.tsx  # Seletor de localização física
            └── api/axios.config.ts
```

---

## 📌 Roadmap de Desenvolvimento — Engenharia de Software

> 💡 Esta seção tem dois níveis. O primeiro descreve o **processo de engenharia** (briefing → design → modelagem → banco → código) que deve ser seguido **antes de qualquer MVP**. O segundo descreve os **MVPs de produção** — o que o sistema entrega em cada lançamento, do mais simples ao completo.

---

### 🔧 Processo de Engenharia (pré-código — todas as fases)

Antes de escrever qualquer linha de código de um MVP, as etapas abaixo devem estar concluídas para aquele MVP. Este é o processo que transforma requisitos em software confiável.

#### ✅ Fase 0 — Ambiente
- [x] Docker Desktop instalado e funcionando
- [x] PostgreSQL 16 no Docker
- [x] pgAdmin conectado ao banco
- [x] Docker Compose com todos os serviços (Nginx, Redis, Kafka, n8n)

#### 🎨 Fase E1 — Design (Figma + FigJam)
- [ ] Navigation Flow — todos os atores (FigJam)
- [ ] Wireframes de baixa fidelidade — todas as telas
- [ ] Mockups de alta fidelidade — todas as telas
- [ ] Telas específicas: PDV, Caixa, RH, Portal Fornecedor, Promoções, Etiquetas, Localização física

#### 🧩 Fase E2 — Modelagem (UML + C4)
- [ ] Diagrama de Casos de Uso — todos os atores
- [ ] Diagrama de Classes — BOM, localização, promoções, fiscal, RH, permissões
- [ ] Diagrama de Sequência — promoção no PDV, FEFO com local, emissão fiscal, rescisão, entrega digital
- [ ] Diagrama de Componentes — comunicação entre módulos
- [ ] C4 Model — Nível 1 (Contexto), Nível 2 (Containers), Nível 3 (Componentes)

#### 🗄️ Fase E3 — Banco de Dados
- [x] Tabela `items` com margem bruta gerada automaticamente
- [ ] `locais_fisicos` — hierarquia recursiva com `pai_id`
- [ ] `item_lotes` com `local_fisico_id`
- [ ] `promocoes` e `promocao_itens`
- [ ] `impressoras` e `etiqueta_configs`
- [ ] `users`, `funcionarios`, `funcionarios_rh`, `historico_funcional`
- [ ] `pdvs`, `movimentos_caixa`
- [ ] `item_midia`, `item_componentes`
- [ ] `orcamentos_compra`, `pedidos_compra`, `entradas_estoque`
- [ ] `emissoes_fiscais`, `comercios`, `mesas`, `comandas`
- [ ] Trigger para recálculo de custo em cascata

---

## 🚀 Roadmap de MVPs — Lançamentos em Produção

> 💡 Cada MVP é um sistema funcional que pode ser colocado em produção e usado por um comércio real. Cada um adiciona módulos sobre o anterior — nunca quebra o que já existe. A ideia é que a cada MVP o sistema já seja útil, e a cada novo lançamento fique ainda mais completo.

```
MVP 1 ──► MVP 2 ──► MVP 3 ──► MVP 4 ──► MVP 5 ──► MVP 6 ──► MVP 7
  Base    Cliente   PDV/Caixa  RH/Func.  Compras  Promoções  IA/Digital
```

---

### 🟢 MVP 1 — Base do Sistema
**Meta:** sistema funcional com gestão de comércio, catálogo de itens, entregas e painel administrativo.

**O que o comércio consegue fazer com este MVP:**
Cadastrar produtos e serviços com composição (BOM), gerenciar estoque básico, receber pedidos online de clientes, acompanhar entregas em tempo real e ter um painel administrativo da plataforma.

**Atores disponíveis:** Administrador da plataforma · Comerciante (Dono) · Entregador · Cliente

```
Backend
  [ ] Módulo auth (JWT + OAuth + refresh token)
  [ ] Módulo users (CRUD com roles)
  [ ] Módulo comercios (cadastro, tipo, configurações)
  [ ] Módulo categorias (nome livre)
  [ ] Módulo items (simples, composto, serviço, combo — BOM recursivo)
  [ ] Módulo item_componentes (composição BOM com detecção de loop)
  [ ] Módulo impostos (herança em 3 níveis)
  [ ] Módulo estoque (entrada nota branca, alertas de mínimo)
  [ ] Módulo orders (criação e listagem de pedidos)
  [ ] Módulo deliveries (status + stream gRPC de localização)
  [ ] Eventos Kafka: pedido.criado · item.estoque_baixo · pedido.pago
  [ ] n8n: e-mail confirmação de pedido · alerta estoque baixo

Frontend
  [ ] Login/Register — Administrador, Comerciante, Entregador, Cliente
  [ ] Dashboard Admin (visão global da plataforma)
  [ ] Dashboard Comerciante (pedidos, estoque, alertas)
  [ ] Catálogo de Itens com BOM (simples, composto, serviço, combo)
  [ ] Form. Item com seção de composição
  [ ] Gestão de Estoque (entrada nota branca, histórico)
  [ ] Lista de Pedidos do Comerciante
  [ ] Dashboard Cliente + Lista Mercados + Lista Produtos + Página Produto
  [ ] Carrinho + Checkout + Status Pedido
  [ ] Rastreamento com mapa gRPC (Tela 10)
  [ ] Dashboard Entregador + Lista Entregas + Mapa Navegação
  [ ] Mapa de Entregas Admin

Banco de Dados
  [ ] Todas as tabelas do MVP 1 criadas e testadas
  [ ] Trigger de recálculo de custo em cascata
```

**Resultado:** Um marketplace funcional onde o comerciante cadastra produtos, o cliente compra online e o entregador realiza as entregas com rastreamento em tempo real.

---

### 🟡 MVP 2 — Modo Restaurante + Cardápio QR + Garçom
**Meta:** ativar o Modo Restaurante completo com os três métodos de atendimento.

**O que o comércio ganha com este MVP:**
Cardápio digital por QR Code nas mesas, painel do garçom com mapa visual do salão, balcão com sistema de senhas, e comandas digitais.

**Atores adicionados:** Garçom · Cliente via QR Code (sem login)

```
Backend
  [ ] Módulo restaurant (mesas, comandas, QR Code, status via WebSocket)
  [ ] Módulo mesa.gateway (WebSocket/SSE para status em tempo real)
  [ ] Módulo qrcode.service (geração de URL por mesa)
  [ ] Eventos Kafka: pedido.pronto
  [ ] n8n: notificação pedido pronto por método (QR/Garçom/Balcão)

Frontend
  [ ] Config. Atendimento (toggles garçom/QR/balcão)
  [ ] Gerenc. Mesas (CRUD de mesas, capacidade, status)
  [ ] Gerador QR Codes (geração e impressão por mesa)
  [ ] Painel do Garçom — Mapa de Mesas com cores por status
  [ ] Comanda da Mesa (lançar itens, total acumulado)
  [ ] Fechar Comanda
  [ ] Painel Balcão (senhas chamadas em tempo real)
  [ ] Cardápio QR Code (PWA pública sem login):
      Cardápio Digital · Detalhe Produto · Carrinho Mesa
      Confirmar Pedido · Status Preparo · Solicitar Conta
```

**Resultado:** Restaurantes, lanchonetes e bares já conseguem usar o sistema completo no salão.

---

### 🟠 MVP 3 — PDV, Movimento de Caixa e Emissão Fiscal
**Meta:** transformar o sistema em uma frente de caixa física com emissão de NFC-e e NF-e.

**O que o comércio ganha com este MVP:**
PDVs nomeados por estabelecimento, abertura e fechamento de caixa com sangria e suprimento, emissão de cupom fiscal (NFC-e) e nota fiscal (NF-e).

**Atores adicionados:** Funcionário Caixa (Nível 2)

```
Backend
  [ ] Módulo permissoes (middleware granular por rota e por nível)
  [ ] Módulo funcionarios (CRUD com perfil e PDVs vinculados)
  [ ] Módulo pdv (CRUD de PDVs com nomes livres)
  [ ] Módulo caixa (abertura, sangria, suprimento, fechamento, relatório)
  [ ] Módulo fiscal (geração XML SEFAZ, integração Focus NF-e/NFe.io/Enotas)
  [ ] Módulo fiscal simulação (emissão local sem certificado para desenvolvimento)
  [ ] n8n: e-mail com XML e DANFE ao cliente após emissão

Frontend
  [ ] Tela de Login com seleção de PDV para Funcionário Caixa
  [ ] PDV — interface de venda (busca de item, quantidade, pagamento)
  [ ] Abertura de Caixa (valor inicial de troco)
  [ ] Operação de Caixa (sangria, suprimento em tempo real)
  [ ] Fechamento de Caixa (conferência por forma de pagamento, diferença)
  [ ] Emissão Fiscal (NFC-e no PDV, NF-e em vendas B2B)
  [ ] Histórico de movimentos por PDV e operador
  [ ] Configuração de impressoras por comércio
```

**Resultado:** O sistema pode substituir uma máquina de cartão + caixa físico, emitindo cupom fiscal em qualquer venda.

---

### 🔵 MVP 4 — Funcionários, Permissões e RH Completo
**Meta:** gestão completa de equipe com controle de acesso e módulo de RH.

**O que o comércio ganha com este MVP:**
Funcionários com perfis de acesso por nível, prontuário digital, histórico funcional automático, controle de férias, cálculo de rescisão e geração de documentos.

**Atores adicionados:** Funcionário Gerente (Nível 4) · Funcionário Estoque (Nível 3) · Funcionário Garçom formalizado

```
Backend
  [ ] Módulo rh (prontuário, histórico, férias, alertas)
  [ ] rescisao.calculator.ts (cálculo automático de verbas trabalhistas)
  [ ] Geração de Termo de Rescisão em PDF (PDFKit/Puppeteer)
  [ ] Upload de documentos de RH (usa infraestrutura de mídia já existente)
  [ ] n8n: alertas de RH (exame médico, fim de contrato, aniversário de admissão)

Frontend
  [ ] Lista de Funcionários com perfis e status
  [ ] Prontuário Digital (dados pessoais, contratuais, documentos)
  [ ] Dashboard do Funcionário (linha do tempo, indicadores)
  [ ] Controle de Férias (saldo, agendamento)
  [ ] Módulo de Rescisão (simulação → PDF → upload assinado → rescindido)
  [ ] Config. de Permissões (customizar acesso por funcionário)
  [ ] Interface adaptada por nível (Caixa vê menos menus que Gerente)
```

**Resultado:** O comerciante gerencia toda a equipe no mesmo sistema, com controle de acesso real por função e documentação trabalhista gerada automaticamente.

---

### 🟣 MVP 5 — Procurement, Fornecedor e Estoque Avançado
**Meta:** ciclo completo de compras com portal do fornecedor, lotes, validade e localização física.

**O que o comércio ganha com este MVP:**
Fluxo formal de compras (orçamento → pedido → recebimento), portal onde o fornecedor responde orçamentos e envia NF, controle de lotes com data de validade, FEFO automático e localização física de cada item no estabelecimento.

**Atores adicionados:** Fornecedor (portal)

```
Backend
  [ ] Módulo locais-fisicos (hierarquia recursiva, caminhoCompleto(), CTE recursiva)
  [ ] Módulo item_lotes (lote + validade + local físico + FEFO)
  [ ] Módulo fornecedores (portal de acesso, resposta de orçamento)
  [ ] Módulo procurement (orçamento → pedido → aprovação → recebimento)
  [ ] Importação de XML NF-e na entrada de estoque
  [ ] Contas a pagar automáticas ao confirmar pedido com prazo
  [ ] n8n: notificação ao fornecedor · alerta de validade próxima (30/15/7 dias)

Frontend
  [ ] Árvore de Locais Físicos (visualização e CRUD hierárquico)
  [ ] Vinculação de lote a local físico na entrada de estoque
  [ ] Relatório de inventário por local físico
  [ ] Transferência de lote entre locais
  [ ] Ordem de Orçamento (lista de itens, seleção de fornecedor)
  [ ] Pedido de Compra (forma de pagamento, aprovação)
  [ ] Recebimento de Mercadoria (conferência, lote, validade, local)
  [ ] Portal do Fornecedor (login, pedidos, resposta de orçamento, upload NF)
  [ ] Relatório de itens próximos do vencimento
```

**Resultado:** O comerciante tem rastreabilidade completa de onde cada produto foi comprado, quanto custou, onde está fisicamente e quando vai vencer.

---

### 🔴 MVP 6 — Promoções, Etiquetas e Material de Oferta
**Meta:** motor de precificação dinâmica e geração de material impresso diretamente do sistema.

**O que o comércio ganha com este MVP:**
Promoções agendadas com ativação e desativação automáticas, "Quinta Verde" e qualquer outro tipo de oferta sem intervenção manual, impressão de etiquetas de gôndola, etiquetas adesivas e cartazes de oferta em PDF com design profissional gerado pelo sistema.

```
Backend
  [ ] Módulo promocoes (estaAtiva() na consulta de preço, recorrência em JSONB)
  [ ] promocao.scheduler.ts (Kafka: promocao.iniciando · promocao.encerrando)
  [ ] Módulo etiquetas (zpl.generator.ts + oferta.generator.ts PDF)
  [ ] Integração com impressoras via ZPL (protocolo de rede) e PDF (browser)
  [ ] n8n: notificação de início/fim de promoção

Frontend
  [ ] Lista de Promoções com status (ativa/agendada/encerrada)
  [ ] Form. Promoção (tipo, vigência, recorrência, itens elegíveis, limites)
  [ ] Dashboard de Promoções (unidades vendidas, desconto total, impacto na margem)
  [ ] Módulo de Etiquetas:
      Seletor de item e tipo de etiqueta (gôndola/adesiva/oferta)
      Preview da etiqueta antes de imprimir
      Seleção de impressora e número de cópias
      Impressão em lote (múltiplos itens de uma vez)
  [ ] Config. de Impressoras (nome, tipo, endereço IP/USB)
  [ ] Config. de Templates de Etiqueta (dimensões, elementos, posições)
  [ ] Cardápio QR e PDV exibem promoção ativa automaticamente
```

**Resultado:** O comerciante cria a "Quinta Verde" uma vez e o sistema aplica automaticamente todo sábado, gera os cartazes de oferta e imprime as etiquetas de gôndola sem que ele precise tocar em nada manualmente.

---

### ⚪ MVP 7 — Mídia Digital, IA e Automações Completas
**Meta:** transformar o sistema em uma plataforma de produtos digitais com atendimento inteligente 24h.

**O que o comércio ganha com este MVP:**
Vender e-books, cursos, templates e qualquer arquivo digital junto com produtos físicos ou como item separado, entregar automaticamente após pagamento, e ter um atendente de WhatsApp com IA respondendo dúvidas dos clientes 24h.

```
Backend
  [ ] Módulo midia (upload multipart, validação MIME, storage S3/local)
  [ ] Geração de presigned URLs com prazo (72h por padrão)
  [ ] Integração Kafka → n8n para entrega automática pós-pagamento

Frontend
  [ ] Seção de Mídia no Form. Item (imagens, vídeo, PDF, arquivos com toggle Apoio/Venda)
  [ ] Área "Meus Downloads" do cliente (produtos digitais adquiridos)
  [ ] Cardápio QR com galeria de imagens e links de apoio visíveis
  [ ] Página do produto com galeria completa e downloads de apoio

Automações n8n (todas)
  [ ] Entrega de produto digital (presigned URLs por e-mail)
  [ ] Recálculo de custo em cascata com alerta de margem
  [ ] Relatório diário de vendas
  [ ] Alertas de RH (exame médico, fim de contrato)
  [ ] Atendimento IA via WhatsApp (Gemini/GPT com escalonamento humano)
  [ ] Configuração de todos os fluxos anteriores revisada e testada
```

**Resultado:** Sistema completo. O comerciante tem uma plataforma de gestão total que cobre do caixa físico ao e-commerce de produtos digitais, com uma equipe de atendimento virtual funcionando 24h.

---

### 📊 Visão Geral dos MVPs

```
         MVP 1      MVP 2      MVP 3      MVP 4      MVP 5      MVP 6      MVP 7
         ─────      ─────      ─────      ─────      ─────      ─────      ─────
Auth       ✅         ✅         ✅         ✅         ✅         ✅         ✅
Admin      ✅         ✅         ✅         ✅         ✅         ✅         ✅
Comércio   ✅         ✅         ✅         ✅         ✅         ✅         ✅
Itens/BOM  ✅         ✅         ✅         ✅         ✅         ✅         ✅
Estoque    ✅         ✅         ✅         ✅         ✅         ✅         ✅
Cliente    ✅         ✅         ✅         ✅         ✅         ✅         ✅
Entregador ✅         ✅         ✅         ✅         ✅         ✅         ✅
gRPC Mapa  ✅         ✅         ✅         ✅         ✅         ✅         ✅
Restaur.              ✅         ✅         ✅         ✅         ✅         ✅
Garçom                ✅         ✅         ✅         ✅         ✅         ✅
QR Code               ✅         ✅         ✅         ✅         ✅         ✅
PDV                              ✅         ✅         ✅         ✅         ✅
Caixa                            ✅         ✅         ✅         ✅         ✅
Fiscal NF                        ✅         ✅         ✅         ✅         ✅
Permissões                       ✅         ✅         ✅         ✅         ✅
Funcionár.                                  ✅         ✅         ✅         ✅
RH                                          ✅         ✅         ✅         ✅
Locais Fís                                             ✅         ✅         ✅
Lotes/FEFO                                             ✅         ✅         ✅
Fornecedor                                             ✅         ✅         ✅
Procurement                                            ✅         ✅         ✅
Promoções                                                         ✅         ✅
Etiquetas                                                         ✅         ✅
Mídia/Digit                                                                  ✅
IA WhatsApp                                                                  ✅
```

---

## 🐳 Comandos Docker Úteis

```bash
docker-compose up -d                         # Subir tudo
docker-compose up -d postgres redis          # Só banco e cache
docker ps                                    # Verificar containers
docker-compose down                          # Parar tudo
docker-compose down -v                       # Parar e apagar dados ⚠️
docker logs market-db                        # Logs do banco
docker logs market-backend                   # Logs do backend
docker logs market-kafka                     # Logs do Kafka
docker-compose up -d --build backend         # Rebuild backend
docker-compose up -d --build frontend        # Rebuild frontend
```

---

## 📚 Conceitos Aplicados

- **Engenharia de Requisitos** — RF e RNF antes do código; evita retrabalho
- **WMS Simplificado** — hierarquia recursiva de locais físicos com `pai_id`; profundidade livre sem tabelas extras; integrado a lotes, FEFO e PDV
- **Motor de Promoções** — precificação dinâmica com vigência, recorrência e canal; verificação na consulta de preço para garantia em tempo real
- **Geração de Etiquetas ZPL** — protocolo nativo de impressoras térmicas (Zebra, Argox, Elgin); template configurável por comércio
- **Material de Oferta em PDF** — geração server-side com PDFKit/Puppeteer; design profissional sem software externo
- **BOM Recursivo** — composição bottom-up com detecção de loop circular (DFS)
- **RBAC + Permissões Granulares** — perfis pré-definidos customizáveis; verificação no middleware de cada rota
- **PDV e Movimento de Caixa** — frente de caixa integrada; sangria, suprimento e fechamento com conferência
- **Emissão Fiscal** — XML SEFAZ para NF-e e NFC-e; abstração de provedor
- **Procurement** — fluxo formal de compras do orçamento ao recebimento
- **HRIS** — prontuário digital com linha do tempo automática e cálculo de rescisão
- **FEFO** — First Expired First Out com localização física do lote
- **Produtos Digitais** — presigned URLs pós-pagamento
- **Multi-tenant** — isolamento por `comercio_id`
- **Hierarquia Recursiva** — tabela auto-referenciada com `pai_id`; query recursiva com CTE (`WITH RECURSIVE`)
- **gRPC** — stream de GPS para mapa de entregas
- **WebSocket / SSE** — notificações em tempo real
- **Kafka** — eventos assíncronos desacoplados
- **JSONB PostgreSQL** — atributos flexíveis com índices
- **Trigger PostgreSQL** — recálculo automático em cascata
- **Docker Compose** — ambiente reproduzível
- **n8n** — automações visuais sem deploy de código

---

## 📄 Licença

Este projeto está sob a licença MIT. Qualquer desenvolvedor pode clonar, adaptar, evoluir e distribuir livremente. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

> Desenvolvido por **Hariel Soares Maran** como portfólio de Engenharia de Software e contribuição à comunidade de desenvolvedores e comerciantes.
