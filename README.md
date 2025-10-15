**# 💳 Payment Calculator

Calculadora de pagamentos simples, direta e 100% front‑end. Ideal para simular parcelas, juros e totais de forma rápida e visual.

[Veja o código-fonte](https://github.com/joaobroggine/payment-calculator)

<p align="left">
  <a href="https://github.com/joaobroggine/payment-calculator"><img alt="Top language" src="https://img.shields.io/github/languages/top/joaobroggine/payment-calculator"></a>
  <a href="https://github.com/joaobroggine/payment-calculator"><img alt="Languages count" src="https://img.shields.io/github/languages/count/joaobroggine/payment-calculator"></a>
  <a href="https://github.com/joaobroggine/payment-calculator"><img alt="Repo size" src="https://img.shields.io/github/repo-size/joaobroggine/payment-calculator"></a>
  <a href="https://github.com/joaobroggine/payment-calculator/commits/main"><img alt="Last commit" src="https://img.shields.io/github/last-commit/joaobroggine/payment-calculator"></a>
  <a href="https://github.com/joaobroggine/payment-calculator"><img alt="License" src="https://img.shields.io/github/license/joaobroggine/payment-calculator"></a>
</p>

## Sumário
- [Visão Geral](#visão-geral)
- [Demonstração](#demonstração)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Executar Localmente](#como-executar-localmente)
- [Como Publicar no GitHub Pages](#como-publicar-no-github-pages)
- [Uso](#uso)
- [Acessibilidade](#acessibilidade)
- [Roadmap](#roadmap)
- [Contribuição](#contribuição)
- [Licença](#licença)
- [Créditos](#créditos)

---

## Visão Geral
Uma aplicação web estática feita com HTML, CSS e JavaScript que ajuda você a:
- Simular valores de pagamento com ou sem entrada
- Visualizar parcelamento e totais
- Explorar diferentes taxas e prazos rapidamente

O projeto é leve, sem dependências de build, e roda apenas com um navegador.

## Demonstração
- Em breve: ative o GitHub Pages (veja abaixo) e coloque aqui o link público, por exemplo:
  - https://joaobroggine.github.io/payment-calculator/

Sugestão de capturas de tela (adicione na pasta `docs/screenshots`):
- Tela principal: `docs/screenshots/home.png`
- Exemplo de simulação: `docs/screenshots/simulation.png`

```text
![Tela Principal](docs/screenshots/home.png)
![Exemplo de Simulação](docs/screenshots/simulation.png)
```

## Funcionalidades
- Entrada de valores e parâmetros de forma intuitiva
- Cálculo instantâneo no navegador
- Exibição limpa dos resultados (parcelas totais, juros, etc.)
- Layout responsivo (mobile/desktop)
- Sem back-end, sem dependências externas

Observação: ajuste esta seção conforme as regras de cálculo implementadas no seu `script.js`.

## Tecnologias
- HTML
- CSS
- JavaScript (Vanilla)

Composição aproximada por linguagem neste repositório:
- JavaScript ~49.1%
- CSS ~33.1%
- HTML ~17.8%

Fonte: métricas do GitHub.

## Estrutura do Projeto
Arquivos principais na raiz:
- [index.html](https://github.com/joaobroggine/payment-calculator/blob/main/index.html)
- [style.css](https://github.com/joaobroggine/payment-calculator/blob/main/style.css)
- [script.js](https://github.com/joaobroggine/payment-calculator/blob/main/script.js)

Pasta sugerida para documentação e imagens:
- `docs/`
  - `screenshots/` — capturas de tela usadas no README

## Como Executar Localmente
Opção 1 — Abrir direto no navegador:
1. Baixe/clonar o repositório.
2. Dê duplo clique em `index.html`.

Opção 2 — Usar um servidor local (recomendado):
- VS Code + extensão “Live Server”, ou
- Python: `python3 -m http.server 5500` (e abra http://localhost:5500)

## Como Publicar no GitHub Pages
1. No GitHub, vá em Settings > Pages.
2. Em “Branch”, selecione `main` e a pasta `/root`.
3. Salve. Aguarde alguns minutos.
4. O link público aparecerá em Settings > Pages. Adicione-o na seção [Demonstração](#demonstração).

## Uso
- Abra a aplicação.
- Preencha os campos necessários (ex.: valor, taxa, número de parcelas, entrada).
- Clique no botão de calcular (se houver) ou veja os resultados atualizarem em tempo real.
- Ajuste os valores para comparar cenários.

Dica: se o projeto usar fórmulas financeiras, você pode documentá-las aqui, por exemplo:
- Juros simples: M = P(1 + i·n)
- Parcela (juros compostos): PMT = P·i / (1 − (1 + i)^−n)

Adapte de acordo com o que realmente está implementado.

## Acessibilidade
Boas práticas recomendadas:
- Labels associados a inputs
- Navegação por teclado
- Contraste adequado de cores
- Mensagens de erro claras
- Leitura por leitores de tela

Verifique estes pontos em `index.html` e `style.css` e ajuste conforme necessário.

## Contribuição
1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b feat/nome-da-sua-feature`
3. Commit: `git commit -m "feat: descrição"`
4. Push: `git push origin feat/nome-da-sua-feature`
5. Abra um Pull Request

Padrões sugeridos:
- Commits no estilo Conventional Commits (feat, fix, chore, docs, refactor…)
- PRs pequenos e focados

## Licença
Ainda sem licença definida. Recomenda-se adicionar um arquivo `LICENSE` (por ex., MIT) para permitir uso e contribuições abertas.

## Créditos
Feito com ❤️ por [@joaobroggine](https://github.com/joaobroggine).

---
Se este projeto te ajudou, considere deixar uma estrela!**
