# Páginas de Natal personalizadas por corretor (Site + CRM)

## O que já existe
- No site, os links de corretor já funcionam: `uhome.com.br/c/{corretor}/campanha/natal` e `/c/{corretor}/em-foco/{produto}` mostram foto, nome e WhatsApp do corretor, sem formulário.
- No CRM (Uhome Sales CRM), cada corretor já tem seu código de link e existe a Central de Natal com materiais, mas nenhuma tela gera esses links do Natal.

## O que vou fazer

### 1. No site (este projeto)
- Nova consulta na ponte com o CRM: "produtos do Natal". Devolve os 10 produtos ativos (nome, foto, bairro, preço, entrega) e os links prontos do corretor: página geral do Natal e uma página para cada produto.
- Confere se o corretor está ativo e tem foto. Se não estiver, avisa em vez de gerar link quebrado.
- Teste automático: o link montado para um corretor sai no formato certo e corretor inativo não recebe link.

### 2. Prompt para o CRM
- Escrevo um prompt pronto para você colar no chat do projeto CRM. Ele cria em "Central de Natal" a área "Minhas páginas de Natal" com:
  - Cartão da página geral do Natal com botões "Copiar link", "Enviar no WhatsApp" e "Abrir".
  - Lista dos 10 produtos com foto e os mesmos botões.
  - Mensagem pronta para o cliente, já com o link do corretor.
  - Prévia de como o cliente vê a página.
- Salvo também como arquivo para você baixar.
- Não consigo alterar o CRM daqui, por isso o prompt.

### 3. Validação ponta a ponta
- Chamo a ponte como o CRM chamaria e confiro os links de 2 corretores reais.
- Abro esses links no computador e no celular: foto, nome, WhatsApp certo do corretor, sem formulário e com o visual do Natal.
- Clico no WhatsApp e confiro se a visita aparece registrada para o corretor.
- Depois que você aplicar o prompt no CRM, confiro a leitura do código do CRM para ver se ficou ligado certo.

## Detalhes técnicos
- `crm-bridge`: nova action `list_natal_links` (auth `x-crm-token`), lê `produtos_foco`/`campanhas` vigentes e `profiles` por `slug_ref`, retorna `{ corretor, campanha_url, produtos[{slug,nome,capa_url,url}] }`.
- O prompt do CRM usa `useBrokerSlug` e chama a ponte por uma função do próprio CRM (token fica no servidor).
- Prompt salvo em `/mnt/documents/prompt-crm-paginas-natal.md`.
