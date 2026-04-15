

## Plano: Localizar e sincronizar o imóvel 10674-UH

### Diagnóstico
O imóvel **10674-UH** não existe na tabela `imoveis` — nenhum registro com "10674" em `jetimob_id`, `slug` ou `titulo`. A sync anterior processou apenas páginas 1-10 (~1000 imóveis).

### Ações

1. **Executar sincronização completa** — rodar o `sync-jetimob` cobrindo todas as páginas (1-50, ~5000 imóveis) para garantir que o novo imóvel seja importado.

2. **Verificar se o imóvel chegou** — após a sync, consultar o banco para confirmar que o código 10674 foi importado.

3. **Se ainda não aparecer** — investigar diretamente na API do Jetimob qual é o identificador real desse imóvel (pode ser que o código "UH" seja um sufixo adicionado internamente e o `jetimob_id` seja diferente).

4. **Corrigir filtro de busca por código (se necessário)** — atualmente a busca filtra por `jetimob_id` e `slug`. Se o código "10674-UH" não bate com nenhum dos dois campos, precisaremos adicionar um campo `codigo_uhome` ou ajustar o mapeamento no `sync-jetimob`.

### Resultado esperado
Buscar `codigo=10674-UH` em `/busca` deve retornar o imóvel correspondente.

