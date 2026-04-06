import { create } from "zustand";
import { submitLead } from "@/services/leads";
import { trackWhatsAppClick } from "@/services/whatsappTracker";
import { trackClickWhatsapp, trackGenerateLead } from "@/lib/gtag";

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

const LEAD_NAME_KEY = "uhome_lead_nome";
const LEAD_PHONE_KEY = "uhome_lead_telefone_form";

export const useWhatsAppLeadStore = create<WhatsAppLeadStore>((set) => ({
  isOpen: false,
  data: null,
  openModal: (data) => {
    const nome = localStorage.getItem(LEAD_NAME_KEY);
    const telefone = localStorage.getItem(LEAD_PHONE_KEY);

    if (nome && telefone) {
      // Bypass: submit lead silently and open WhatsApp directly
      submitLead({
        nome,
        telefone,
        imovel_id: data.imovel_id,
        imovel_slug: data.imovel_slug,
        imovel_titulo: data.imovel_titulo,
        imovel_bairro: data.imovel_bairro,
        imovel_preco: data.imovel_preco,
        origem_componente: data.origem_componente,
      }).catch(() => {});

      trackWhatsAppClick({
        imovel_id: data.imovel_id,
        imovel_titulo: data.imovel_titulo,
        imovel_slug: data.imovel_slug,
        origem_pagina: window.location.href,
      });
      trackClickWhatsapp({
        origem_componente: data.origem_componente,
        imovel_titulo: data.imovel_titulo,
        imovel_slug: data.imovel_slug,
      });
      trackGenerateLead({
        origem_componente: data.origem_componente,
        imovel_titulo: data.imovel_titulo,
        imovel_slug: data.imovel_slug,
      });

      window.open(data.whatsappUrl, "_blank", "noopener");
      return;
    }

    set({ isOpen: true, data });
  },
  closeModal: () => set({ isOpen: false, data: null }),
}));
