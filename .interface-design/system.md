# Design System

## Direction
- Personality: Sobriedade premium para um e-commerce de serviços em mármore e granito, com foco em confiança, acabamento e atendimento direto.
- Product world: superfícies minerais, showroom de alto padrão, venda consultiva, corte sob medida, instalação profissional e orçamento orientado por projeto.
- Signature: contraste entre blocos escuros do hero e painéis claros com vidro fosco, mantendo a sensação de vitrine sofisticada de serviços e não de loja genérica.

## Tokens

### Spacing
- Base: 4px
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48

### Radius
- Scale: 8px, 12px, 16px, 24px, 28px, 32px
- Usage:
  - 8px a 12px para badges, inputs e elementos pequenos
  - 16px a 24px para cards e painéis
  - 28px a 32px para blocos hero e seções de destaque

### Colors
- Canvas: `#fcfcfc` ate `#f5f5f5`
- Primary text: `#0d0d0d`
- Secondary text: `#404040`
- Soft neutral: `#d9d9d9`
- Surface white: `#ffffff`
- Line: `rgba(64, 64, 64, 0.16)`
- Hero overlay: `rgba(13, 13, 13, 0.72)` a `rgba(13, 13, 13, 0.92)`
- Accent for WhatsApp CTA: verde somente para contato e acao comercial

### Depth
- Strategy: sombras suaves combinadas com bordas finas de baixa opacidade
- Cards padrao: `1px solid rgba(64, 64, 64, 0.16)` com sombra macia
- Hero glass panels: blur + borda translúcida + sombra mais profunda
- Rule: superfícies claras ficam em camadas leves; o hero usa profundidade mais forte e atmosfera escura

## Typography
- Headings: peso alto, contraste forte, escala ampla em hero e detalhe
- Body: neutro, legível e com ritmo confortável
- Labels: uppercase com tracking aberto para contexto técnico e premium
- Tone: direto, comercial e seguro; evitar linguagem excessivamente promocional, varejista ou genérica

## Surface Rules
- Hero: escuro, cinematográfico, com banner fotográfico e overlay em gradiente
- Painéis da vitrine: claros, levemente translúcidos, borda discreta e sombra suave
- Destaques promocionais: manter a base neutra do sistema; promoções usam ênfase por estrutura, não por excesso de cor
- Detalhe do serviço: imagem e descrição em uma coluna, decisão comercial e contato em outra

## Patterns

### Hero Publico
- Estrutura: grade em duas colunas, com bloco principal de narrativa e coluna de diferenciais
- Superfície: vidro escuro com blur e borda clara translúcida
- Conteúdo: headline forte, texto curto, CTAs diretos e selos de contexto voltados para contratação e orçamento

### Card de Produto
- Superfície: fundo claro em degradê suave
- Imagem: quadrada, dominante e com zoom leve no hover
- Conteúdo: categoria visível, nome forte, oferta de serviço clara, preço ou chamada de orçamento, CTA simples
- Comportamento: leve elevação no hover, sem excesso de animação

### Filtros do Catálogo
- Estrutura: barra compacta em painel claro
- Inputs: brancos, borda cinza translúcida, foco preto suave
- Objetivo: parecer utilitário e refinado, sem competir com os serviços expostos na vitrine

### Painel de Detalhe
- Estrutura: coluna esquerda para galeria e descrição; coluna direita para categoria, preço e CTA
- Preço: bloco principal com divisor horizontal e tipografia grande
- CTA: fica dentro do bloco principal, com destaque claro e botão verde de WhatsApp

### Logica Comercial
- Tratar a interface como e-commerce de serviços: a vitrine vende capacidade, qualidade, execução e confiança.
- O preço pode existir, mas o principal gatilho comercial é orçamento e conversa consultiva.
- A navegação deve ajudar o usuário a sair da dúvida e chegar ao contato.

### Botao Primario da Vitrine
- Fundo: gradiente escuro entre `#0d0d0d` e `#404040`
- Texto: branco
- Uso: CTAs principais da vitrine, navegação e destaque de ação

### CTA de WhatsApp
- Verde reservado para conversão
- Deve aparecer apenas quando o usuário já estiver próximo da decisão
- A cópia deve reforçar orçamento, atendimento rápido e contato direto

## Copy Guidelines
- Priorizar: orçamento, acabamento, precisão, alto padrão, sob medida, atendimento rápido, execução profissional
- Evitar: frases muito genéricas de marketing, linguagem de varejo puro ou excesso de adjetivos sem informação concreta
- O texto deve sempre parecer de e-commerce de serviço especializado, não de loja genérica de produto físico

## Constraints
- Não introduzir paletas coloridas fora do contexto do catálogo sem motivo forte
- Não usar layouts excessivamente genéricos de e-commerce padrão
- Não misturar muitos estilos de card na mesma seção sem motivo de conteúdo
- Preservar a separação visual entre área pública sofisticada e admin utilitário
- Evitar decisões que façam a vitrine parecer marketplace comum; a percepção deve ser de serviço premium e atendimento consultivo