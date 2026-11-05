# Drogaria Franco — loja online + painel admin

O pedido é grande, então vamos construir em etapas, seguindo a ordem do seu documento. Cada etapa deixa o site funcionando antes de passarmos para a próxima.

## Identidade visual (tirada da logo)
- Primária (turquesa da logo): #0E9AA7 — topo do site, links, ícones ativos
- Primária escura (botões "Comprar" / "Adicionar", passa no contraste AA): #0A6F79
- Secundária (azul-petróleo escuro do contorno do coração): #12343B — selos, destaques
- Cruz vermelha: #E5262B — usada só em "Exige receita" e mensagens de erro
- Neutros: #FFFFFF, #F5F6F8, texto #1F2937; verde #16A34A para estoque/desconto, amarelo #F59E0B para avisos
- Fonte Nunito Sans, cantos de 10px, sombras suaves, ícones de linha
- A logo aparece no topo, no rodapé, no ícone da aba e no login do admin

## Etapa 1 (este turno): visual, topo, rodapé e página inicial + banco de dados e admin de produtos
**Vitrine**
- Faixa superior com mensagens que alternam (frete grátis, retirada na loja, WhatsApp)
- Topo fixo: logo, busca grande com sugestões (aceita erros de acento/digitação), Entrar, Meus pedidos, carrinho com contador; campo de CEP salvo
- Menu de categorias (menu grande no computador, gaveta lateral no celular), carregado do banco
- Página inicial: carrossel de banners, atalhos de categorias, vitrines (Ofertas da semana, Mais vendidos, Genéricos, Dermocosméticos, Vistos recentemente), faixa de vantagens, bloco do farmacêutico, newsletter com aceite LGPD
- Card de produto completo: selo de desconto, preço de/por, parcelamento, selos Genérico / Exige receita, botão Adicionar que vira – 1 +, Últimas unidades / Indisponível + Avise-me
- Rodapé com dados legais mostrando "[preencher no admin]"; botão flutuante de WhatsApp; aviso de cookies

**Lovable Cloud**
- Todas as tabelas listadas no documento, com regras de acesso: cliente vê só os próprios dados, admin vê tudo, produtos ativos públicos
- Papel de admin numa tabela separada, verificado no servidor
- Pastas de arquivos: imagens de produtos (pública) e receitas (privada)
- Dados de exemplo: 6 categorias com subcategorias e 24 produtos fictícios marcados "EXEMPLO"

**Admin (/admin)**
- Login (e-mail e senha), menu lateral
- Produtos: cadastro completo (todos os campos do item 3.2, incluindo classificação de venda — controlados aparecem só como "Disponível na loja física"), fotos múltiplas com reordenação, lista com busca/filtros, edição rápida de preço e estoque, duplicar
- Categorias: criar, editar, reordenar

## Etapas seguintes
2. Páginas de categoria/busca com filtros e ordenação; página do produto com abas, aviso obrigatório de medicamento, similares, avaliações
3. Carrinho (gaveta + página, cupom, barra de frete grátis) e checkout em 4 passos com ViaCEP, Pix, cartão, pagar na entrega, envio de receita; pedidos no admin com linha do tempo, aprovação de receita e baixa de estoque
4. Área do cliente, cupons, banners, vitrines configuráveis, tabela de frete, configurações da loja e cores
5. Dashboard, importação/exportação por planilha, e-mails, SEO (sitemap, dados estruturados), Mercado Pago (pedido fica "Aguardando pagamento" até você adicionar a chave)

## Pendências que você precisa me passar (uso textos provisórios até lá)
- Valor mínimo para frete grátis, número do WhatsApp, telefone, e-mail, horário e endereço da loja
- Razão social, CNPJ, farmacêutico(a) + CRF, AFE, licença sanitária (nunca serão inventados)

## Detalhes técnicos
- TanStack Start + Lovable Cloud; preços e totais sempre recalculados em funções do servidor
- Cores como variáveis em src/styles.css (oklch equivalentes aos HEX acima)
- Logo enviada guardada como arquivo hospedado; favicon gerado a partir do coração
- Busca tolerante via normalização sem acento + extensão de similaridade de texto no banco
