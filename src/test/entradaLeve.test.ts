import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// Arquivos que entram na 1ª tela não podem puxar o cliente do banco (≈250 KB) direto.
const ARQUIVOS = ['src/hooks/useFavoritos.ts', 'src/hooks/useAuth.tsx', 'src/components/Navbar.tsx', 'src/components/home/HomeVitrine.tsx', 'src/App.tsx', 'src/main.tsx'];

describe('entrada leve', () => {
  for (const f of ARQUIVOS) it(`${f} usa o cliente sob demanda`, () => {
    expect(readFileSync(f, 'utf8')).not.toMatch(/from ["']@\/integrations\/supabase\/client["']/);
  });
});
