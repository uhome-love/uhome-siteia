# Página inicial de alto nível: o que eu melhoraria

Analisei a página inteira no computador e no celular. Ela está limpa, mas hoje funciona mais como "vitrine institucional" do que como máquina de gerar contato com corretor. Seguem os pontos, em ordem de impacto na conversão.

## O que encontrei
1. **Números diferentes na mesma página:** a abertura diz "21.493+ imóveis", a seção "Por que a Uhome" diz "19.543+" e o texto do rodapé diz "14.600". Isso tira credibilidade.
2. **Nenhum imóvel aparece na página inicial.** A pessoa vê bairros, empreendimentos do Natal e textos, mas nenhum apartamento à venda com preço. Portais que convertem mostram imóveis logo no começo.
3. **Falta prova social:** não há depoimentos, avaliações do Google, número de famílias atendidas nem rostos dos corretores.
4. **"Por que a Uhome" é genérico:** 4 cards de recursos e números como "91% foco em Porto Alegre" não convencem o comprador.
5. **Poucos convites ao contato:** depois da abertura, o único botão forte é "Explorar imóveis". Não há um "fale com um corretor" no meio da página.
6. **Celular cansativo:** os cards de recursos ocupam 3 telas inteiras empilhados, e os links de categoria viram uma lista longa.
7. **Bloco de texto SEO aparente** antes do rodapé, com cara de "texto para o Google". Pode ficar mais discreto.

## O que vou fazer

### 1. Imóveis logo no começo (maior impacto)
- Nova faixa **"Imóveis à venda em destaque"** logo depois do Natal, com abas: Mais procurados, Novos esta semana, Até R$ 500 mil e Alto padrão.
- Os cards são os mesmos da busca (fotos que deslizam, preço, quartos, área privativa, favoritar), em carrossel com setas no computador e deslize no celular.
- **"Vistos recentemente"**: para quem já navegou, aparece no topo dessa faixa com os últimos imóveis abertos.

### 2. Número único e verdadeiro
- O total de imóveis vem de uma única contagem do banco e aparece igual em todo lugar: abertura, "Por que a Uhome" e rodapé.

### 3. Prova social e confiança
- Faixa **"Quem comprou com a Uhome"** com 3 depoimentos e nota/estrelas.
- **"Conheça nossos corretores"**: carrossel com foto, nome e bairros de especialidade, com botão de WhatsApp de cada um. Usa os corretores já cadastrados.
- Selos: CRECI, anos de mercado e imóveis vendidos.

### 4. "Por que a Uhome" focado no comprador
- Troca dos 4 cards de recurso por **"Como funciona" em 3 passos**: Encontre (busca/IA), Visite (agende online) e Compre com segurança (financiamento e documentação).
- No celular vira um carrossel horizontal, em vez de 3 telas empilhadas.

### 5. Convites ao contato no ponto certo
- Bloco **"Não achou? Um corretor busca para você"** no meio da página: nome, WhatsApp e o que procura. O lead vai para o CRM pelo fluxo que já existe.
- Atalho para o **simulador de financiamento** ("Quanto fica a parcela?").

### 6. Bairros mais úteis
- Cada card de bairro mostra também o **preço médio** e "a partir de R$ X". No celular vira carrossel em vez de grade alta.

### 7. Acabamento moderno
- Menu que encolhe e fica translúcido ao rolar.
- Seções com o mesmo ritmo de espaço, títulos e margens. O texto SEO fica mais discreto, dentro de um "Saiba mais".
- Animações suaves de entrada das seções, sem atrasar o carregamento.

## Ordem final da página
```text
Abertura com busca
Natal Chave de Ouro (banner + empreendimentos)
Imóveis à venda em destaque (+ vistos recentemente)
Bairros em destaque (com preço médio)
Como funciona (3 passos)
Não achou? Um corretor busca para você
Quem comprou com a Uhome + corretores
Busque por categoria
Perguntas frequentes
Rodapé
```

## Preciso de você
- **Depoimentos reais:** nomes, textos e, se possível, a nota do Google. Sem isso eu deixo a seção pronta e escondida até você mandar. Não vou inventar depoimentos.
- **Números da Uhome:** anos de mercado e imóveis vendidos, para os selos.

## Detalhes técnicos
- Contagem única: hook `useTotalImoveis` (queryKey compartilhada) usado em HeroSection, PorQueUhome e SeoLinksSection, substituindo os números fixos.
- Faixa de imóveis: reaproveitar SearchPropertyCard e as queries existentes (`status = disponivel`, com foto, `.range`), com abas via filtros prontos. Vistos recentemente a partir de `localStorage.imoveis_vistos`.
- Corretores: leitura pública dos perfis já sincronizados (só os campos públicos).
- Lead "corretor busca para você": inserir na tabela de leads existente; a sincronização com o CRM continua pelos gatilhos do banco, nunca pelo site.
- Preço médio por bairro: RPC agregada com cache de 10 minutos.
- Validação com Playwright em 1440, 1024, 390 e 360 px; checagem de velocidade do primeiro carregamento antes e depois.
