"""Gera só o molde da Home a partir da captura do app (mobile.json/desktop.json).
Uso: python3 scripts/gerar-home-dobra.py /tmp/browser/home-molde
Não gera CSS nem altera os demais moldes.
"""
import json
import sys
from pathlib import Path
from bs4 import BeautifulSoup

data = json.loads((Path(sys.argv[1]) / 'mobile.json').read_text())

def soup(html):
    return BeautifulSoup(html, 'html.parser')

card = soup(data['card'])
for el in card.select('.fotos-card-slide, .fotos-card-seta, .fotos-card-pontos'):
    el.decompose()
for a in card.select('a'):
    a['href'] = '{{HREF}}'
    if a.has_attr('aria-label'):
        a['aria-label'] = '{{TITULO}}'
img = card.select_one('img')
img['src'] = '{{FOTO}}'
img['alt'] = '{{TITULO}} - foto 1'
img['fetchpriority'] = '{{PRIORIDADE}}'
img['loading'] = '{{LOADING}}'
info = card.select_one('.catalog-info')
info.select_one('h2').string = '{{TITULO}}'
info.select('p')[0].string = '{{STATS}}'
info.select('p')[1].string = '{{LOCAL}}'
info.select_one('strong').string = '{{PRECO}}'
badge = card.select_one('.catalog-badge')
if badge:
    badge.replace_with('{{SELO}}')

faixa = soup(data['categorias'])
trilho = faixa.select_one('.home-categorias-trilho')
categoria = soup(str(trilho.select_one('a')))
categoria.a['href'] = '{{HREF}}'
categoria.img['src'] = '{{ICONE}}'
categoria.span.string = '{{NOME}}'
trilho.clear()
trilho.append('{{CATEGORIAS}}')
faixa.select_one('.faixa-rolavel').attrs.pop('data-dir', None)

parts = {'NAV_HOME': data['nav'], 'BARRA_HOME': data['bottom'], 'CAPA_HOME': data['hero'], 'FAIXA_HOME': str(faixa), 'CATEGORIA_HOME': str(categoria), 'CARD_HOME': str(card)}
Path('supabase/functions/site-dobra/moldes-home.ts').write_text(
    '// Gerado do HTML real da Home (375 e 1440 px), sem recriar classes.\n'
    '// scripts/gerar-home-dobra.py: gerar novamente ao mudar a primeira tela.\n'
    + ''.join(f'export const {k} = {json.dumps(v, ensure_ascii=False)};\n' for k, v in parts.items()))