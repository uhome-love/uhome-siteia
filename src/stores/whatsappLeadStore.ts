import { create } from "zustand";

export interface WhatsAppLeadData {
  whatsappUrl: string;
  origem_componente: string;
  imovel_id?: string;
  imovel_slug?: string;
  imovel_titulo?: string;
  imovel_bairro?: string;
  imovel_preco?: number;
}

interface WhatsAppLeadStore {
  isOpen: boolean;
  data: WhatsAppLeadData | null;
  openModal: (data: WhatsAppLeadData) => void;
  closeModal: () => void;
}

export const useWhatsAppLeadStore = create<WhatsAppLeadStore>((set) => ({
  isOpen: false,
  data: null,
  openModal: (data) => set({ isOpen: true, data }),
  closeModal: () => set({ isOpen: false, data: null }),
}));
