# Cartões de Estudo

PWA de flashcards para estudos de concursos. MVP pessoal, custo zero:
frontend estático no GitHub Pages, backend no Google Apps Script, banco
de dados numa planilha do Google Sheets.

🔗 Em produção: https://raysekiane.github.io/flash-cards/

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| UI | Tailwind CSS |
| Estado | Zustand |
| Cache offline | Dexie (IndexedDB) |
| Backend | Google Apps Script |
| Banco de dados | Google Sheets |
| Deploy | GitHub Pages + GitHub Actions |
| PWA | vite-plugin-pwa |

## Arquitetura

```
GitHub Pages (PWA)
   React + Vite
       ↓
 Zustand + Dexie (cache local, offline-first)
       ↓
 fetch() com ?key=... na URL
       ↓
 Apps Script (getAll / saveProgress)
       ↓
 Google Sheets (uma aba por deck)
```


## Rodando localmente

```bash
git clone https://github.com/raysekiane/flash-cards
cd flash-cards
npm install
cp .env.example .env   # preencha com a URL do seu deploy e sua chave
npm run dev
```

Variáveis de ambiente (`.env`, nunca commitado):

```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/SEU_DEPLOYMENT_ID/exec
VITE_APP_KEY=sua-chave-secreta
```

## Backend (planilha + Apps Script)

Cada aba da planilha é um deck, com colunas `CardId | Pergunta | Resposta
| Explicação | Categoria`. `CardId` pode ficar em branco ao digitar uma
linha nova — o próprio backend gera um id automaticamente na próxima
sincronização.

Passo a passo completo de setup e deploy do backend:
[`apps-script/README.md`](apps-script/README.md).

## Deploy

Push em `main` builda e publica automaticamente no GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (também
pode ser disparado manualmente pela aba Actions). O build precisa dos
secrets do repositório `VITE_APPS_SCRIPT_URL` e `VITE_APP_KEY`
configurados em Settings → Secrets and variables → Actions.

## Estrutura de pastas

```
src/
  features/
    decks/        # lista de decks, estatísticas por deck
    flashcards/    # modo de estudo, flip do card
    progress/      # acertos/erros, estatísticas gerais
  shared/
    db/            # schema Dexie (cache local)
    services/      # appsScriptService (fetch) + syncService (orquestra sync)
    utils/         # shuffle, datas, validação
    hooks/
  components/      # layout, header, tema, sync button, alerts
  pages/           # composição das telas (Decks, Estudo, Progresso)
apps-script/
  Code.gs          # backend Apps Script
  README.md        # setup do backend
```
