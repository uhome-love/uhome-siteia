# Home: correção da causa raiz do LCP

## A — Molde
- `site-dobra` não calcula mais a paisagem antiga para a Home. Novo cache `home-lar-2-1` isola os corpos antigos.
- `moldes-home.ts` foi gerado do HTML real do app em 375 e 1440 px, com header, busca desktop, categorias e cinco cartões. Não redesenhou CSS nem textos.
- Um único `<img fetchpriority="high" loading="eager">`: primeira foto de Novos no site, no mesmo URL `wsrv.nl`, 480×432, WebP q62 do app. O app hoje não usa srcset/sizes no cartão; não se inventou uma segunda variante.
- No celular, as demais fotos aguardam o app/interação sem baixar fotos de capa concorrentes; desktop mantém a grade. Não há Gasômetro nem preload da paisagem.
- Alvo da troca: `[data-uh-home-novos] .catalog-photo img[fetchpriority=high]`. Original preservado na posição inicial e só espelho escondido; agora a retenção também verifica posição x/y além das dimensões.
- Dados do seed viram initialData de React Query: os cartões e categorias montam imediatamente, sem quadro de skeleton substituindo dados prontos.
- Histórico depende de `imoveis_vistos` local: no parser, reserva a mesma altura apenas quando há IDs válidos; o app mantém esse espaço até os dados. Histórico sem resultados é recolhido só após interação, não durante a primeira pintura. Não vazou histórico ao servidor.

## B — Parâmetros e intermitência
- Função normaliza o pathname de `path` antes de rotear/cachear. `/`, `/?utm_source=ig`, gclid/gbraid/wbraid etc. resolvem a mesma Home; produto com rastreio mantém slug e prefixo do corretor.
- Memória de 60 s deduplica leituras simultâneas; respostas vazias/erros não ficam no cache. Cache persistente ausente ou velho é renovado no pedido em vez de devolver vazio.
- Endpoint publicado: `/`, `/?utm_source=ig&utm_medium=paid` e em-foco com gclid deram molde em 3/3 leituras cada. Partidas frias observadas entre ~1,9–2,9 s; quente ~76–127 ms. É latência daqui, não medição Brasil.
- Worker versionado já trata Home pelo pathname, mesmo com query. Portanto a falha observada no domínio não é explicada pelo código versionado; sem ler o Worker ativo não é possível afirmar se há outra versão/regra na borda.
- Código do Worker preparado: espera fria de 300 ms → 3000 ms, pedido da função até 4500 ms, chave de cache `versao=lar-2`, não grava corpo vazio. Cache quente continua imediato; partida fria pode aumentar TTFB até o limite para priorizar a presença da dobra.
- **Worker não publicado:** não há conexão Cloudflare disponível nesta sessão. Link entregue para conectar. A lista de robôs real é mantida pela central e deverá ser conservada antes de qualquer upload; o arquivo não teve BOT_UA alterado.

## C — Busca e imóvel
- Busca Ads/filtrada continua sem molde por regra existente; busca padrão mantém seu molde. Não se mudou esse caminho.
- Molde do imóvel adiado: precisa reproduzir galerias distintas mobile/desktop e seus controles, reaproveitar o payload e adicionar roteamento da borda. Só foto/título/preço sem essa paridade poderia introduzir nova troca/CLS. A consulta antecipada da rodada anterior permanece.

## HTML confirmado
No **endpoint site-dobra publicado**, não confundir com HTML final de uhome.com.br:

| Path | uh-pre | Img high | Gasômetro |
|---|---|---|---|
| `/` | Sim, 3/3 | Foto do apartamento Tristeza, código 69244-TR, primeiro cartão | Não |
| `/?utm_source=ig&utm_medium=paid` | Sim, 3/3 | A mesma foto e URL/variante | Não |

`fetchpriority=high` aparece em uma imagem real, além do preload da mesma imagem no head.
HTML final do domínio não foi consultado daqui por bloqueio regional proposital e ausência de acesso ao Worker ativo. A central deverá confirmar do Brasil após publicar front/borda.

## Publicação e compatibilidade
- `site-dobra` publicado, versão final SHA-256 `9a652d0d7a2c0714af0cd7eee46e1cb2816c85748d08b27063daa99563873959`.
- Front não publicado. Novo molde exige meta `uh-home-layout=lar-2`; HTML lar-1 descarta o novo pre antes da pintura. Isso evita capa incompatível, mas a melhoria da foto pronta só fica ativa **após publicar o front**.
- Mudança de função pode ir antes do front por esse gate; a entrega estável com query também depende de atualizar o Worker ativo/caches. Cache antigo da borda pode sobreviver até seu TTL.
- Sem Google Ads, mudanças de consentimento, rastreio, gtag ou conversões; nenhum lead real enviado.

## Testes
- **315 testes, 63 arquivos, passaram**; registros automáticos build OK.
- Playwright contra localhost com resposta real do endpoint publicado, bloqueando `main` para provar que a primeira foto já estava carregada/visível com app evaluation = 0.
- 375×812: Home sem query e Instagram; 1440 e 1920 desktop; aparelho com histórico. Sem nenhuma requisição Gasômetro. Posição/tamanho da foto idênticos antes/depois do app; retenção ativa.
- CLS observado final: mobile 0; mobile Instagram 0,0153; 1440 0,0371; 1920 Instagram 0,0344; mobile histórico 0. Não são notas Lighthouse nem medianas de produção.
- Desktop: x do primeiro ícone = x do logo (40 px em 1440, 280 px em 1920); Filtros termina em x=1400/1640, igual ao último cartão.
- Em-foco com gclid: pre presente e preço R$329 mil antes de main em 375/1440; formulário abriu depois, sem enviar. Imagem externa indisponível na sessão local; sua prioridade/URL no HTML foram confirmadas, sem alegar renderização da foto.
- Nenhuma exceção JavaScript nas verificações.

## Arquivos
`index.html`, `HomeVitrine.tsx`, `index.css`, `novidade.ts` (reexport), `_shared/novidade.ts`, `site-dobra/index.ts`, `homeDobra.ts`, `cacheDobra.ts`, `moldes-home.ts`, `cloudflare/uhome-seo-bot-handler.js`, `scripts/gerar-home-dobra.py`, três testes novos, AGENTS e roadmap.