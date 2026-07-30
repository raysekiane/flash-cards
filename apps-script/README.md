# Backend (Google Sheets + Apps Script)

## 1. Estrutura da planilha

Cada **aba** da planilha é um **deck**. O nome da aba vira o `deckName` no
app — não existe uma coluna separada para isso. Colunas esperadas em cada
aba de deck (ordem livre, nomes comparados sem acento/caixa):

| CardId | Pergunta | Resposta | Explicação | Categoria |
|---|---|---|---|---|
| ENG-001 | O que é um Sprint? | Ciclo curto e fixo de trabalho no Scrum | | Metodologias ágeis |

Exemplo real em uso: `decks_app_flashcards`, com as abas `Engenharia de
Software`, `Banco de Dados`, `Legislação`, `Português`.

As abas **Progresso** e **Metadata** são reservadas — o script cria e
preenche sozinho na primeira chamada, não precisa criar na mão.

**CardId é opcional ao digitar.** Se você adicionar uma linha nova com só
Pergunta/Resposta preenchidos e deixar CardId em branco, o próprio
`getAll` gera um id automaticamente (prefixo do nome do deck + sequencial,
ex: `ENG-006`) na primeira sincronização depois de você adicionar a linha
— não precisa preencher isso na mão nem rodar nada separado.

## 2. Colar o script

Na planilha: **Extensões > Apps Script**. Apague o conteúdo padrão de
`Code.gs` e cole o conteúdo de [`Code.gs`](./Code.gs) deste repositório.

## 3. Configurar a chave secreta

No editor do Apps Script: ícone de engrenagem **Configurações do projeto**
> **Propriedades do script** > **Adicionar propriedade do script**:

- Propriedade: `APP_KEY`
- Valor: a mesma string que vai em `VITE_APP_KEY` no `.env` do frontend

## 4. Publicar como Web App

**Implantar > Nova implantação**:
- Tipo: **App da Web**
- Executar como: **Eu**
- Quem tem acesso: **Qualquer pessoa**

Autorize as permissões quando solicitado. Copie a URL gerada (termina em
`/exec`) — esse é o valor de `VITE_APPS_SCRIPT_URL`.

**Importante:** toda vez que editar `Code.gs`, use **Gerenciar implantações
> Editar (lápis) > Nova versão > Implantar** para publicar as mudanças. A
URL continua a mesma, mas sem uma nova versão o código antigo continua
rodando.

## Por que a chave vai em query param, não em header

Apps Script Web Apps não expõem os headers da requisição HTTP para o
script (`doGet`/`doPost` só recebem `e.parameter`), e um header custom
como `X-App-Key` forçaria o navegador a mandar um preflight `OPTIONS` que
o Apps Script não responde — a request falharia por CORS. Por isso
`VITE_APP_KEY` viaja como `?key=...` na URL, e o `saveProgress` usa
`Content-Type: text/plain` no POST para continuar sendo uma "simple
request" e não disparar preflight.
