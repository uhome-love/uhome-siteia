# Tirar o Anderson do site

O cadastro "Anderson Amaral da Silva" (corretor) ainda está ativo no site. A última sincronização com o CRM foi em 18/11, antes do desligamento.

## O que fazer
1. Marcar o cadastro dele como inativo no site (o mesmo que a sincronização com o CRM faz para quem sai).
   - Some da vitrine de corretores, da página "Nossos corretores" e de prévias.
   - O link pessoal dele (/c/anderson-amaral-da-silva) passa a abrir o site normal, com formulário da Uhome, sem o cartão nem o WhatsApp dele.
2. Rodar a sincronização de corretores para confirmar que o CRM não o reativa.
3. Conferir no navegador a vitrine e o link pessoal.

## O que não muda
- Leads antigos dele, histórico e os demais corretores.
- O outro cadastro "Anderson Amaral" é só uma conta de visitante (login Google), sem papel de corretor; não aparece no site e fica como está.
- Nada de código e nada de Google Ads.

## Detalhe técnico
`update profiles set ativo=false where id='bd80d601-6fce-4464-b00d-f200891e184f'`. As consultas da vitrine, do CorretorContext e do ssr-render já filtram `ativo = true`.
