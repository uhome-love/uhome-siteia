

## Comparação Uhome vs QuintoAndar — Melhorias Prioritárias

### O que a Uhome já faz bem (paridade ou superior)
- Prefetch agressivo no hover (React Query + chunk preload)
- Progressive rendering com IntersectionObserver
- Lazy loading de Mapbox (só carrega quando necessário)
- Scroll position restore via Zustand
- Transição suave com opacity no refetch
- Filtros avançados em drawer (padrão QuintoAndar)
- Badges inteligentes (Novidade, Ótimo preço, Em obras)
- Pins com preço no mapa

### Gaps identificados (o que o QuintoAndar faz melhor)

---

#### 1. Card do imóvel: informação de custos mensais (ALTO IMPACTO)

**QuintoAndar mostra:** Preço + "R$ 709 Cond. + IPTU" como soma única abaixo do preço.
**Uhome mostra (desktop):** Só preço. Cond/IPTU aparecem apenas no card mobile.

**Correção:** No card desktop (`SearchPropertyCard.tsx`, linhas 422-433), adicionar a linha de custos mensais (Cond. + IPTU) igual ao mobile. QuintoAndar mostra a soma: `R$ {cond + iptu} Cond. + IPTU`.

---

#### 2. Card do imóvel: preço acima, título abaixo (layout invertido)

**QuintoAndar:** Título/descrição → Preço grande → Custos → Stats → Endereço
**Uhome desktop:** Tipo · Bairro → Stats → Preço (no final)

**Correção:** Reorganizar o card desktop: Preço grande primeiro, custos mensais, stats, endereço. Preço é o dado mais importante — deve estar no topo do bloco de texto.

---

#### 3. Endereço com rua no card

**QuintoAndar:** "Rua Portugal, Higienópolis · Porto Alegre"
**Uhome:** "Bairro, Porto Alegre" (sem rua)

**Verificação necessária:** Checar se a tabela `imoveis` tem campo de endereço/rua. Se sim, mostrar. Se não, manter como está — sem dados falsos.

---

#### 4. Suspense fallback: spinner genérico

**QuintoAndar:** Transição entre rotas é instantânea (SSR + streaming)
**Uhome:** `PageFallback` mostra spinner centralizado em tela cheia — abrupto.

**Correção em `App.tsx`:** Substituir o spinner fullscreen por um skeleton que mantém a navbar visível. O fallback deve mostrar `<Navbar />` + skeleton do conteúdo, não uma tela em branco com spinner.

---

#### 5. Navbar: prefetch no mousedown (não só hover)

**QuintoAndar:** Navegação é quase instantânea.
**Uhome:** Prefetch no `mouseEnter` do link "Comprar" já existe, mas poderia também prefetchar no `mousedown` de qualquer link interno para ganhar ~100-200ms.

**Correção:** Adicionar `onMouseDown={handlePrefetchBusca}` além do `onMouseEnter` existente. Também prefetchar o chunk da página de destino em links de bairros, tipos, etc.

---

#### 6. View Transitions API (navegação suave entre rotas)

**QuintoAndar:** Transições entre páginas são suaves, sem "flash branco".
**Uhome:** Cada navegação mostra um flash breve do Suspense fallback.

**Correção:** Usar `document.startViewTransition` (com fallback) no `navigate()` para animar a saída/entrada de páginas. Isso é uma melhoria progressiva — funciona em Chrome/Edge, fallback silencioso em outros.

---

#### 7. Mapa: clusters com contagem vs preço

**QuintoAndar:** Clusters mostram contagem numérica (ex: "227", "65").
**Uhome:** Igual — clusters com contagem. Mas os pins individuais da Uhome já mostram preço (QuintoAndar não mostra preço nos pins). Uhome está à frente aqui.

---

### Plano de Implementação (4 arquivos)

**Prioridade 1 — Card desktop com preço no topo + custos mensais**
- `src/components/SearchPropertyCard.tsx` — Reorganizar bloco de texto desktop (linhas 422-433): preço grande primeiro, custos mensais, stats, endereço

**Prioridade 2 — PageFallback com Navbar visível**
- `src/App.tsx` — Substituir `PageFallback` por skeleton com Navbar, eliminando a tela em branco

**Prioridade 3 — Prefetch no mousedown**
- `src/components/Navbar.tsx` — Adicionar `onMouseDown` nos links de navegação

**Prioridade 4 — View Transitions API**
- `src/App.tsx` ou wrapper de navegação — Envolver `navigate()` com `startViewTransition` quando disponível

### Resultado esperado
- Cards mostram informação financeira completa como QuintoAndar
- Zero "tela branca" entre navegações
- Percepção de velocidade ainda melhor com prefetch antecipado
- Transições visuais suaves entre rotas

