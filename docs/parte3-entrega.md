# Parte 3 — busca com mapa

## Ajuste de vitrine aprovado por Lucas
Faixa numérica abaixo da capa removida por completo, sem espaço residual. Nota agregada Google e quantidade de corretores não são argumentos de vitrine nem da Lia; avaliações individuais e perfis permanecem. Imagem `og-default.jpg` mantém a arte, agora sem o antigo total de imóveis. Não havia `aggregateRating` no código ativo. Esta rodada não modifica site-dobra nem Worker; os modelos antigos continuam intactos. Conferência em 390/1440: junção da capa com a próxima seção sem intervalo e 12 avaliações individuais preservadas.

## Pedido de aviso de preço
Transportado pelo pipeline existente, via `submitLead`, `contexto.pedidos` e `dados_site.pedidos`. O CRM deve gerar uma nota por ID novo, sem duplicar no reenvio.

```json
{
  "id": "UUID persistido durante as tentativas do formulário",
  "tipo": "aviso_preco",
  "dia": null,
  "periodo": null,
  "planta": null,
  "assunto": "Avisar quando o preço baixar",
  "empreendimento": null,
  "pagina": "/busca",
  "horario": "2026-11-18T02:44:00.000Z",
  "financiamento": null,
  "imoveis": ["UUID do imóvel 1", "UUID do imóvel 2", "UUID do imóvel 3"]
}
```

Lead: `tipo_interesse=favorito`, `origem_componente=favorito`, `formulario=aviso_preco`; evento `aviso_preco_pedido`. O pedido não promete disparador automático: acompanhamento é feito pelo CRM. Nenhum contato de teste foi enviado.

## Publicação e compatibilidade
- Busca usa `busca_site`, consulta aditiva que não muda as consultas do app já publicado.
- Modelo de busca novo selecionado por `uh-dobra-versao=site-v3`; site-v2/site-v1 conservam seus modelos. Home e Foco preservam o visual aprovado.
- Banco já atualizado; publicar o app após conferir a nova função site-dobra. Worker não alterado.
- `dynamic-sitemap?type=catalogo` contém catálogo ativo e URLs novas. A cópia `public/sitemap.xml` é atualizada com o mesmo catálogo.
- `updated_at` de imóveis é atualizado pela sincronização diária e não prova mudança significativa; usamos `publicado_em`. Produtos/campanhas omitem lastmod na ausência de `ficha/config.conteudo_atualizado_em`. Páginas estáticas sem data autoritativa também omitem lastmod.
- A hospedagem estática não atualiza o arquivo publicado quando o banco muda. A central deve encaminhar `/sitemap.xml` ao sitemap dinâmico na camada que já atende os mapas do site, sem mudar o Worker, para saída automática de páginas inativas; uma cópia publicada é apenas uma fotografia do catálogo.
- Miniaturas próprias imutáveis dos primeiros cards estão em `buscaMiniaturas.json`. A atualização de catálogo a cada três minutos é automática; criação de novos Assets exige o uploader da central/ambiente de publicação. Na ausência de miniatura própria de imóvel recém-entrado, o fallback segue wsrv; o mecanismo de upload da CDN não está disponível na função.
- Medição oficial do domínio é feita pela central no Brasil; não contornar bloqueio regional.
## Contagens internas conferidas em 18/11/2026

Por decisão do Lucas, os totais não são vitrine: Home, títulos, textos e prévias ficam sem quantidade de imóveis. Mantidos o botão Mostrar N imóveis, categorias com pelo menos 8 resultados e proteção contra URLs vazias. A remoção na tela pronta é exclusiva de site-v3; site-v1/site-v2 preservados.

| Categoria | Imóveis | Lançamentos | Investir |
|---|---:|---:|---:|
| Apartamentos | 9.898 | 782 | 0 |
| Casas em condomínio | 1.402 | 147 | 0 |
| Studios/lofts | 439 | 96 | 439 |
| Terrenos | 2.048 | 17 | 0 |
| Pronto pra morar | 19.908 | 0 | 343 |
| Até R$ 400 mil | 8.978 | 374 | 256 |
| Em Canoas | 671 | 134 | 2 |

Valores abaixo de 8 não aparecem na faixa. Categorias consideram a seção; outros filtros aplicados ficam nos chips.

| URL | Resultados |
|---|---:|
| /busca | 21.380 |
| /lancamentos-porto-alegre | 1.272 |
| /apartamentos-ate-400-mil-porto-alegre | 4.690 |
| /casas-em-condominio-porto-alegre | 1.182 |
| /studios-para-investir-porto-alegre | 430 |
| /imoveis-canoas | 671 |

## Verificação local
- Busca: LCP 580 ms, foto 1 da tela pronta; main.tsx termina em 599 ms; CLS 0,00095.
- Lançamentos: LCP 160 ms, foto 1 da tela pronta; main.tsx termina em 177 ms; CLS 0,00095.
- Mesma URL própria de foto, 768 px, espelho retido e um H1.
- Não são medições Lighthouse 13 de produção nem evidência de LCP oficial até 2,5 s; a central mede após publicar.
- Filtros Canoas até R$ 400 mil: 346 imóveis. Vazio verificado com Canoas e 99 quartos, remoção de um filtro disponível.
- Favoritos: terceiro abre aviso, 3 permanecem após recarregar, sem envio do formulário.
- Previews das cinco URLs: 200. Sitemap dinâmico e estático incluem 10 páginas em-foco.
