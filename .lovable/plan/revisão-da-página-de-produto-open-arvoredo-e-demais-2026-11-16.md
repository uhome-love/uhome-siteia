# Revisão da página de produto (Open Arvoredo e demais)

A estrutura está boa e próxima da referência. Ainda não está no ideal: encontrei 6 pontos que atrapalham a confiança e a conversão no celular.

## O que corrigir

1. **Legendas "(imagem provisória)" aparecendo para o cliente** nas fotos. Esconder esse trecho das legendas (fica só "Acesso e portaria", "Piscina" etc.).
2. **Linha do endereço misturada com a frase de efeito** ("Passo d'Areia, Porto Alegre · o primeiro Open com suíte..."). Separar: endereço numa linha, frase logo abaixo do nome, em destaque.
3. **Dois botões "Agendar visita" com cores diferentes** (roxo no topo, dourado na barra de baixo). Usar uma cor só para o botão principal em toda a página.
4. **Menu de seções cortado à direita** ("Localizaçã..."), sem indicar que dá para arrastar. Adicionar leve esmaecimento na borda e marcar a seção atual enquanto rola.
5. **Plantas muito altas no celular** (cada card ocupa quase a tela inteira). Reduzir a imagem da planta e mostrar as tipologias em carrossel lateral, para ver preço de todas mais rápido.
6. **Formulário de visita**: escolher automaticamente o primeiro dia disponível e o período "Tarde", para a pessoa só preencher nome e WhatsApp (menos toques = mais agendamentos).

## Depois

- Publicar e mandar prints no celular do Open Arvoredo e do Orygem.
- Sugestão (opcional, depende de você): mandar textos próprios (motivos e dúvidas) para os outros 9 produtos, como fizemos no Open Arvoredo.

## Detalhes técnicos
- Legendas: limpar `/\s*\((imagem )?provis[óo]ria\)/i` na exibição (sem alterar o banco).
- Botão: unificar no token primário; barra fixa usa a mesma variante.
- Nav: IntersectionObserver para seção ativa + máscara de gradiente.
- Plantas: `snap-x` horizontal no mobile, imagem com altura máxima.
- `AgendaVisitaFoco`: estado inicial com primeiro dia e "tarde".
