import { create } from "zustand";

export interface MapBounds {
  lat_min: number;
  lat_max: number;
  lng_min: number;
  lng_max: number;
}

export interface SearchFilters {
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
  codigo: string;
  andarMin: number;
  condominioMax: number;
  iptuMax: number;
  condominio: string;
  bounds: MapBounds | null;
}

interface SearchState {
  filters: SearchFilters;
  page: number;
  scrollY: number;
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  resetFilters: () => void;
  setFilters: (f: Partial<SearchFilters>) => void;
  setPage: (p: number) => void;
  setScrollY: (y: number) => void;
}

const defaultFilters: SearchFilters = {
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
  codigo: "",
  andarMin: 0,
  condominioMax: 0,
  iptuMax: 0,
  condominio: "",
  bounds: null,
};

export const useSearchStore = create<SearchState>((set) => ({
  filters: { ...defaultFilters },
  page: 0,
  scrollY: 0,
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value }, page: 0 })),
  resetFilters: () => set({ filters: { ...defaultFilters }, page: 0 }),
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f }, page: 0 })),
  setPage: (p) => set({ page: p }),
  setScrollY: (y) => set({ scrollY: y }),
}));
