import { create } from "zustand";

export interface MapBounds {
  lat_min: number;
  lat_max: number;
  lng_min: number;
  lng_max: number;
}

export interface SearchFilters {
  finalidade: "venda" | "";
  tipo: string;
  bairro: string;
  cidade: string;
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
  bounds: MapBounds | null;
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
  cidade: "Porto Alegre",
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
  bounds: null,
};

export const useSearchStore = create<SearchState>((set) => ({
  filters: { ...defaultFilters },
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: { ...defaultFilters } }),
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
}));
