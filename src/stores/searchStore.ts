import { create } from "zustand";

export interface SearchFilters {
  finalidade: "venda" | "locacao" | "";
  tipo: string;
  bairro: string;
  precoMin: number;
  precoMax: number;
  areaMin: number;
  areaMax: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  diferenciais: string[];
  ordem: "recentes" | "preco_asc" | "preco_desc" | "area_desc";
  q: string;
}

interface SearchState {
  filters: SearchFilters;
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  resetFilters: () => void;
  setFilters: (f: Partial<SearchFilters>) => void;
}

const defaultFilters: SearchFilters = {
  finalidade: "",
  tipo: "",
  bairro: "",
  precoMin: 0,
  precoMax: 0,
  areaMin: 0,
  areaMax: 0,
  quartos: 0,
  banheiros: 0,
  vagas: 0,
  diferenciais: [],
  ordem: "recentes",
  q: "",
};

export const useSearchStore = create<SearchState>((set) => ({
  filters: { ...defaultFilters },
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: { ...defaultFilters } }),
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
}));
