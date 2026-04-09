

## Fix: Recriar `src/pages/PortoAlegrePilar.tsx`

O arquivo foi perdido entre edições. Precisa ser recriado para resolver o erro de build.

### O que será feito

**Criar `src/pages/PortoAlegrePilar.tsx`** — página pilar SEO para "Imóveis em Porto Alegre" com:
- Navbar + Footer
- Hero com título e descrição otimizados para SEO
- Grid de links para tipos de imóvel (apartamentos, casas, coberturas, studios, comerciais)
- Seção de bairros em destaque (`FeaturedNeighborhoods`)
- FAQ com schema (`HomeFaqSection`) usando formato `{ q, a }`
- `useCanonical("/imoveis-porto-alegre")`
- JSON-LD structured data

**Alterar `src/App.tsx` linha 59** — padronizar import com extensão `.tsx` para consistência com os demais lazy imports:
```
const PortoAlegrePilar = lazy(() => import("./pages/PortoAlegrePilar.tsx"));
```

### Resultado
Build passará sem erros e a rota `/imoveis-porto-alegre` voltará a funcionar.

