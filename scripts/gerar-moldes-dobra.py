# Gera supabase/functions/site-dobra/moldes.ts a partir do HTML que o app monta no celular.
# Uso: python3 scripts/capturar-dobra.py (salva /tmp/browser/pre/*.html) e depois este script.
import re, json
from bs4 import BeautifulSoup
D = "/tmp/browser/pre/"
h = open(D + "home.html").read(); b = open(D + "busca.html").read(); q = open(D + "bosque.html").read()
def cut(s, start, end_tok, inclusive=True):
    i = s.index(start); j = s.index(end_tok, i)
    return s[i:j + len(end_tok)] if inclusive else s[i:j]
def navde(s):
    nav = re.sub(r' id="radix-[^"]+"', '', cut(s, '<nav data-uh-header', '</nav>'))
    camp = re.search(r'<a class="[^"]*" href="/campanha/[^"]+">.*?</a>', nav)
    return nav.replace(camp.group(0), "{{DESTAQUE}}") if camp else nav
hero = cut(h, '<section data-uh-capa', '</section>')
hero = hero.replace(" animate-[heroSlideIn_0.7s_cubic-bezier(0.16,1,0.3,1)_both]", "").replace(" animate-[heroCardIn_0.6s_0.2s_cubic-bezier(0.16,1,0.3,1)_both]", "")
hero = re.sub(r'[\d.]+\+ imóveis com curadoria', '{{TOTAL}} imóveis com curadoria', hero)
btn = re.search(r'<div class="hidden sm:block">(.*?)</div></div><a href="#corretor-busca"', hero).group(1)
hero = hero.replace(btn, "{{BOTAO}}")
topo = cut(b, '<div class="uh-header-spacer">', '<div class="flex flex-1 min-h-0', inclusive=False)
topo = re.sub(r'>[\d.]+ imóveis<', '>{{COUNT}} imóveis<', topo)
grade = cut(b, '<div class="flex flex-1 min-h-0', '<div class="grid content-start items-start grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">')
cab = cut(q, '<header', '</header>')
botoes = "".join(str(el) for el in BeautifulSoup(q, "html.parser").select('[data-uh-capa] button.hidden.sm\\:inline-flex'))
out = [("NAV", navde(h)), ("NAV_BUSCA", navde(b)), ("HERO", hero), ("BUSCA_TOPO", topo), ("BUSCA_GRADE", grade), ("CABECALHO_FOCO", cab), ("BOTOES_FOCO", botoes)]
open("supabase/functions/site-dobra/moldes.ts", "w").write(
    "// Gerado a partir do HTML que o próprio app monta (celular, 390 px). Mantém classes idênticas para a troca não piscar.\n"
    "// Ao mudar a capa da home, o topo da busca, o menu ou o topo das páginas em foco, gere de novo (scripts/gerar-moldes-dobra.py).\n"
    + "".join(f"export const {k} = {json.dumps(v, ensure_ascii=False)};\n" for k, v in out))
