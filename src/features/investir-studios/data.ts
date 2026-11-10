/**
 * Números da landing de studios Cyrela (gerados a partir do estudo de cenários da Uhome).
 * Preços: tabela Última Chance Cyrela, novembro de 2026. Atualize aqui quando a tabela mudar.
 */
export const LP_DATA = {
  "produtos": [
    {
      "id": "connect",
      "nome": "Connect João Wallig",
      "status": "Pronto para morar",
      "m2": "26 m²",
      "preco": 325582,
      "bonus": true,
      "entrega": "Pronto para morar",
      "fluxo": null,
      "obra": null,
      "entrada": 32558.2,
      "parcela": 2706.85,
      "curto": "Connect João Wallig",
      "stCurto": "Pronto",
      "bairro": "Passo d'Areia",
      "local": "Passo d'Areia, perto do Iguatemi",
      "porque": [
        "Ao lado do Bourbon Wallig e do Shopping Iguatemi",
        "A menor entrada entre os prontos"
      ],
      "thumb": "/lp/investir-studios/img/t-connect.webp",
      "img": "/lp/investir-studios/img/op-connect.webp",
      "img2": "/lp/investir-studios/img/op-connect-2.webp"
    },
    {
      "id": "skyglass",
      "nome": "Skyglass Parque Moinhos",
      "status": "Pronto para morar",
      "m2": "25 m²",
      "preco": 371611,
      "bonus": true,
      "entrega": "Pronto para morar",
      "fluxo": null,
      "obra": null,
      "entrada": 37161.1,
      "parcela": 3075.4,
      "curto": "Skyglass Moinhos",
      "stCurto": "Pronto",
      "bairro": "Moinhos de Vento",
      "local": "Rio Branco, entre o Parcão e a Goethe",
      "porque": [
        "O endereço mais procurado para curta temporada",
        "Rooftop, piscina com vista e coworking"
      ],
      "thumb": "/lp/investir-studios/img/t-skyglass.webp",
      "img": "/lp/investir-studios/img/op-skyglass.webp",
      "img2": "/lp/investir-studios/img/op-skyglass-2.webp"
    },
    {
      "id": "vista",
      "nome": "Vista Menino Deus",
      "status": "Fase final de obra",
      "m2": "25 m²",
      "preco": 379979,
      "bonus": false,
      "entrega": "Entrega prevista: abril de 2027",
      "fluxo": null,
      "obra": null,
      "entrada": 37997.9,
      "parcela": 3142.4,
      "curto": "Vista Menino Deus",
      "stCurto": "Entrega abr/2027",
      "bairro": "Menino Deus",
      "local": "Menino Deus, perto da Orla",
      "porque": [
        "Perto da Orla do Guaíba e do Beira-Rio",
        "Rooftop com piscina voltada para o pôr do sol"
      ],
      "thumb": "/lp/investir-studios/img/t-vista.webp",
      "img": "/lp/investir-studios/img/op-vista.webp",
      "img2": "/lp/investir-studios/img/op-vista-2.webp"
    },
    {
      "id": "skyline",
      "nome": "Skyline Menino Deus",
      "status": "Em construção",
      "m2": "19 m²",
      "preco": 302754,
      "bonus": false,
      "entrega": "Entrega prevista: dezembro de 2028",
      "fluxo": {
        "entrada": 0.1,
        "mensais": 0.08,
        "nMensais": 24,
        "reforcos": 0.12,
        "nReforcos": 2,
        "financiado": 0.7
      },
      "obra": {
        "entrada": 30275.4,
        "mensal": 1009.18,
        "nMensais": 24,
        "reforco": 18165.24,
        "nReforcos": 2,
        "totalObra": 90826.2,
        "financiado": 211927.8
      },
      "entrada": 30275.4,
      "parcela": 1985.39,
      "curto": "Skyline Menino Deus",
      "stCurto": "Entrega dez/2028",
      "bairro": "Menino Deus",
      "local": "Menino Deus, perto da Orla",
      "porque": [
        "O menor preço do cardápio",
        "30% pagos durante a obra, 70% financiados na entrega"
      ],
      "thumb": "/lp/investir-studios/img/t-skyline.webp",
      "img": "/lp/investir-studios/img/op-skyline.webp",
      "img2": "/lp/investir-studios/img/op-skyline-2.webp"
    }
  ],
  "base": {
    "preco": 371611,
    "entradaPct": 0.1,
    "taxaAA": 0.1065,
    "prazo": 360,
    "seguro": 100,
    "faturamentoMes": 6200,
    "custoPct": 0.22,
    "irDedutivelPct": 0.19,
    "fixoMes": 400,
    "fixoMesSemCondo": 40,
    "condoGratisMeses": 12,
    "mobiliaTotal": 55000,
    "mobiliaEntrada": 11000,
    "mobiliaParcelas": 24,
    "mesesImplantacao": 2,
    "crescRenda": 0.06,
    "valorizacao": 0.05,
    "cdi": [
      0.13,
      0.1175,
      0.105,
      0.1
    ],
    "irBanco": 0,
    "irAluguel": 0,
    "sazonal": true,
    "mesInicio": 11,
    "horizonteAnos": 30
  },
  "diaria": 310,
  "saz": [
    {
      "mes": "jan",
      "idx": 0.886,
      "ev": ""
    },
    {
      "mes": "fev",
      "idx": 0.762,
      "ev": "Carnaval"
    },
    {
      "mes": "mar",
      "idx": 1.042,
      "ev": "South Summit"
    },
    {
      "mes": "abr",
      "idx": 0.889,
      "ev": "Páscoa"
    },
    {
      "mes": "mai",
      "idx": 0.96,
      "ev": ""
    },
    {
      "mes": "jun",
      "idx": 1.089,
      "ev": "Congressos"
    },
    {
      "mes": "jul",
      "idx": 1.093,
      "ev": ""
    },
    {
      "mes": "ago",
      "idx": 1.092,
      "ev": "Expointer"
    },
    {
      "mes": "set",
      "idx": 1.126,
      "ev": "20 de Setembro"
    },
    {
      "mes": "out",
      "idx": 0.967,
      "ev": ""
    },
    {
      "mes": "nov",
      "idx": 1.026,
      "ev": ""
    },
    {
      "mes": "dez",
      "idx": 1.068,
      "ev": "Natal e Réveillon"
    }
  ],
  "whatsapp": "5551992597097",
  "waPadrao": "Olá! Vi a página de studios Cyrela da Uhome e quero saber mais sobre os studios para investir.",
  "ofertaFim": "2026-11-30T23:59:59-03:00"
};

export type LpData = typeof LP_DATA;
export type LpProduto = LpData["produtos"][number];
