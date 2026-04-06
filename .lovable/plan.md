

## Integrar busca IA no card principal da Hero

### Problema
A busca por IA fica em uma seção separada abaixo da Hero, criando uma experiência fragmentada. O usuário precisa rolar para encontrá-la.

### Solução
Transformar o toggle do card Hero de 2 abas ("Buscar imóveis" / "Anunciar imóvel") para 3 abas: **"Buscar imóveis"** | **"Busca IA"** | **"Anunciar imóvel"**. A aba "Busca IA" mostra o campo de texto livre com sparkles e sugestões rápidas, tudo dentro do mesmo card.

### Mudanças

**1. `src/components/HeroSection.tsx`**
- Alterar o tipo do estado `modo` de `"comprar" | "anunciar"` para `"comprar" | "ia" | "anunciar"`
- Adicionar estado `aiQuery` para o texto da busca IA
- Adicionar o botão "Busca IA" no toggle (com icone Sparkles)
- Renderizar o conteúdo IA quando `modo === "ia"`: campo de input com placeholder, botão "Buscar com IA", e chips de sugestões rápidas
- Remover o link "Busca inteligente por IA" do rodapé da aba "comprar" (já não necessário)

**2. `src/pages/Index.tsx`**
- Remover o import e uso do `<AISearchSection />`

**3. `src/components/AISearchSection.tsx`**
- Manter o arquivo (pode ser usado em outros lugares), mas ele não será mais renderizado na Home

### Visual esperado

```text
┌─────────────────────────────────────────┐
│  [Buscar imóveis] [Busca IA] [Anunciar] │
├─────────────────────────────────────────┤
│  ✨  Descreva o imóvel dos seus sonhos  │
│  ┌─────────────────────────────────┐    │
│  │ Ex: Apto 3 quartos Moinhos...   │ →  │
│  └─────────────────────────────────┘    │
│                                         │
│  "Apto 2q Parcão"  "Cobertura Moinhos"  │
│  "Casa piscina Três Figueiras"          │
└─────────────────────────────────────────┘
```

### O que NÃO muda
- Aba "Buscar imóveis" (filtros manuais) fica idêntica
- Aba "Anunciar imóvel" fica idêntica
- Nenhuma lógica de busca ou filtro é alterada
- Nenhum outro componente é modificado

