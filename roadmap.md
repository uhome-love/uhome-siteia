# Roadmap
- [x] Velocidade mobile — 3ª rodada (código): script leve do HTML inicia busca/detalhe antes de main, detalhe reaproveita consulta/preload responsivo, fotos extras só após interação; 286 testes e ações em 375×812 verificadas, sem publicar. Nenhuma função mudou.
- [ ] Velocidade mobile — 3ª rodada (diagnóstico oficial): divisão LCP das três páginas e resultado após deploy do front. Bloqueio: API PageSpeed 429 por cota diária, inclusive nas repetições sem chave; aguardam relatórios oficiais do Brasil. Fotos do em-foco/avatar não acessíveis na conferência local; preço, barra e abertura dos formulários/LIA verificados.
- [x] Faixa de categorias: Home no container do header/cartões e busca nas suas margens; máscaras/setas e respiro mobile verificados em 1440/1920/375 px; 279 testes passaram, sem publicar. Molde ativo da Home não contém essa faixa e margens do molde mobile da busca permanecem iguais.
- [x] Velocidade mobile — 2ª rodada (código): ajuda e interruptores sob demanda, gatilho de saída separado do formulário, catálogo público sem inicializar SDK, conta sem sessão após load/idle; 279 testes e ações mobile verificados, sem publicar.
- [ ] Velocidade mobile — 2ª rodada (medição): tabela gzip antes → depois e 15 módulos maiores do entry. Bloqueio: compilação manual não permitida nesta sessão e relatório da compilação automática indisponível; analisador de chunks de produção incluído, sem números de desenvolvimento como substituto.
- [x] Velocidade mobile: adiar dependências fora da primeira tela, medir localmente, validar contatos e publicar site-dobra.
- [ ] Velocidade mobile: comparar produção 8572719 → HEAD, cinco rodadas por página, 375×812, CPU 4×, rede 150 ms/1,6 Mbps e site-dobra; corrigir regressões >5% e CLS >0,05. Bloqueio: builds manuais não permitidos nesta sessão, artefatos compilados não disponíveis e prévia hospedada responde 401. Sem mudanças de código ou publicação por ausência de comparação válida; 267 testes passaram em 20/11.
- [x] Anúncios ligados aos ícones 3D (Garden, Casas em condomínio, Terrenos, Studios)
- [x] Studios R$ 8/dia + destino lista de studios
- [ ] SEO: reforçar páginas de bairro/empreendimentos (próxima rodada)
- [ ] Decidir verba de Imóveis do Site — espera o valor de um lead e 2 semanas de dados

- [ ] 04/12: rever anúncios (Imóveis do Site acima de R$80 por contato = recomendar pausar tudo; Natal termina 18/12)
- [x] Página /em-foco/:slug com oferta na 1ª tela, barra fixa, sem menu do app, formulário "tabela e plantas" e molde site-dobra
- [x] Conversão Ads: cartão de seleção na /busca (anúncio), barra em-foco ordem, prova Google, SEO em-foco, tirar GTM do ssr-render, velocidade segura
- [x] Ads: 6 mudanças aprovadas (textos RSA Natal/POOR, Golden Lake amplas, negativas fgts/subsidio/caixa, callouts)
