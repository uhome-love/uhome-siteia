# Próxima parte do visual: Favoritos em pastas

Segue o design "Site Uhome" (telas "Favoritos com pastas · computador" e "Favoritos · celular"). A página do imóvel continua aguardando publicação; esta parte não mexe nela.

## O que a pessoa verá
- **Pastas**: "Todos" e pastas criadas pela pessoa (ex.: "Para visitar", "Para a família"). Criar, renomear e apagar pasta. Um imóvel pode ficar em mais de uma pasta.
- **Ao tocar no coração**: o imóvel é salvo em "Todos" e aparece uma pequena barra "Salvo · Escolher pasta".
- **Nota em cada imóvel**: campo curto ("perto da escola da filha"), salvo na hora.
- **Compartilhar pasta**: gera um link só para ver (sem editar), que abre a pasta com as fotos, e botão de WhatsApp com esse link.
- **Agendar visitas**: na pasta, marcar vários imóveis e pedir visita usando o mesmo fluxo de visita (dia → horário → dados) que já vai para o CRM.
- **Sem login**: tudo funciona no aparelho, como hoje; ao entrar na conta, pastas e notas são levadas junto.
- Celular 390 px e computador 1440 px no visual novo (Montserrat, azul da marca, grafite); empreendimentos salvos ficam como uma seção dentro de "Todos".

## Fica de fora desta parte
- **Entrar com WhatsApp**: precisa de um serviço de envio de código por WhatsApp que o site ainda não tem. Fica registrado como pendência; seguem e-mail e Google.

## Detalhes técnicos
- Novas tabelas `favorito_pastas` (id, user_id, nome, ordem, share_token) e `favorito_pasta_itens` (pasta_id, imovel_id, nota), com RLS por dono e GRANTs; leitura pública da pasta compartilhada só via função `pasta_compartilhada(token)` (security definer, sem dados pessoais).
- `src/lib/favoritosLocais.ts` passa a guardar pastas e notas no aparelho; migração para a conta no login, no mesmo padrão já usado para os favoritos.
- Nova rota `/favoritos/p/:token` (noindex). Visitas em lote reutilizam `AgendamentoVisita`/`submitLead`, então chegam ao CRM pelos gatilhos existentes; nenhum lead de teste real (envios simulados nos testes).
- Testes: item em várias pastas, apagar pasta não apaga o favorito, link compartilhado só lê, migração local → conta.
- Sem Worker, sem site-dobra.
