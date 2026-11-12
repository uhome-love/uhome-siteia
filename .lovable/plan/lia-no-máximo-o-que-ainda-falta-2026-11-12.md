# LIA no máximo: o que ainda falta

Resposta curta: ainda não. Ela já usa a ficha completa, busca pelo nome, sugere parecidos, não fala de MCMV e pede nome e WhatsApp no início. Faltam as partes abaixo.

## 1. Qualificar o lead de verdade
- Durante a conversa, descobrir com naturalidade (uma pergunta por vez): para morar ou investir, faixa de valor, prazo de compra, se vai financiar ou tem entrada, bairro e quartos desejados.
- Guardar essas respostas e enviar ao CRM junto com o resumo, com uma nota de temperatura (quente, morno, frio).
- Lead quente (prazo curto + faixa compatível) recebe convite direto para visita.

## 2. Abertura de acordo com a página
- Na página de um imóvel ou da campanha de Natal, a primeira mensagem já fala daquele imóvel.
- Na página de studios, fala de investimento.

## 3. Chat mais fácil no celular
- Indicador de "digitando".
- Imóveis aparecem como cartões com foto e preço, clicáveis.
- Botões rápidos: "Ver valores", "Agendar visita", "Simular entrada".
- Mensagem amigável se houver falha.

## 4. Teste completo
- 25 conversas simuladas (preço, bairro, sem entrada, investimento, recusa de contato, Golden Lake, Open Bosque etc.), com nota antes e depois.
- Uma conversa completa no celular até chegar ao CRM com qualificação; depois apagar os testes.

## Detalhes técnicos
- Nova ferramenta `registrar_qualificacao` na `lia-chat`, salvando em `lia_conversas` (campos jsonb) e incluída no payload enviado pelos gatilhos existentes ao CRM.
- Contexto da página (rota, slug, campanha) enviado pelo widget no início.
- Cartões renderizados a partir dos resultados das ferramentas retornados pela função.
