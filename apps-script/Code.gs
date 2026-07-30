/**
 * Backend do Cartões de Estudo. Script vinculado (container-bound) à
 * planilha "decks_app_flashcards".
 *
 * Cada aba da planilha é um deck (ex: "Engenharia de Software", "Banco de
 * Dados"). O nome da aba é o deckName. Colunas esperadas em cada aba de
 * deck (a ordem não importa, os nomes são comparados sem acento/caixa):
 *   CardId | Pergunta | Resposta | Explicação | Categoria
 *
 * As abas "Progresso" e "Metadata" são reservadas para o próprio script
 * (ele cria e preenche sozinho, na primeira chamada de getAll/saveProgress
 * se ainda não existirem):
 *   Progresso: cardId | status | reviewCount | lastReviewed | updatedAt
 *   Metadata:  deck | version | updatedAt | contentHash
 *
 * Configuração obrigatória antes do deploy:
 *   Project Settings > Script Properties > adicionar "APP_KEY" com o
 *   mesmo valor usado em VITE_APP_KEY no frontend.
 */

const RESERVED_SHEET_NAMES = ['Progresso', 'Metadata'];

const DECK_FIELD_HEADERS = {
  cardId: ['cardid'],
  pergunta: ['pergunta'],
  resposta: ['resposta'],
  explicacao: ['explicacao', 'explicação'],
  categoria: ['categoria'],
};

function doGet(e) {
  return handleRequest_(e, function (action) {
    if (action === 'getAll') return handleGetAll_();
    if (action === 'fillMissingCardIds') return handleFillMissingCardIds_();
    return { success: false, error: 'Ação desconhecida: ' + action, type: 'bad_request' };
  });
}

function doPost(e) {
  return handleRequest_(e, function (action) {
    if (action === 'saveProgress') {
      const payload = JSON.parse(e.postData.contents);
      return handleSaveProgress_(payload);
    }
    return { success: false, error: 'Ação desconhecida: ' + action, type: 'bad_request' };
  });
}

function handleRequest_(e, run) {
  try {
    if (!checkKey_(e)) {
      return jsonResponse_({ success: false, error: 'Chave inválida', type: 'auth' });
    }
    return jsonResponse_(run(e.parameter.action));
  } catch (err) {
    return jsonResponse_({ success: false, error: err.message, type: 'server_error' });
  }
}

function checkKey_(e) {
  const expected = PropertiesService.getScriptProperties().getProperty('APP_KEY');
  const provided = e.parameter.key;
  return !!expected && provided === expected;
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function normalize_(text) {
  // Remove diacritics (combining marks, U+0300..U+036F) after NFD
  // decomposition, e.g. "Explicação" -> "explicacao". Written as a
  // charCode filter instead of a regex to avoid unicode-escape ambiguity.
  const decomposed = String(text || '').normalize('NFD');
  let result = '';
  for (let i = 0; i < decomposed.length; i++) {
    const code = decomposed.charCodeAt(i);
    if (code >= 0x0300 && code <= 0x036f) continue;
    result += decomposed[i];
  }
  return result.trim().toLowerCase();
}

function getOrCreateSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sheet;
}

function getDeckSheets_() {
  return SpreadsheetApp.getActiveSpreadsheet()
    .getSheets()
    .filter(function (sheet) {
      return RESERVED_SHEET_NAMES.indexOf(sheet.getName()) === -1;
    });
}

function readDeckCards_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headerIndex = {};
  values[0].forEach(function (header, i) {
    const normalized = normalize_(header);
    Object.keys(DECK_FIELD_HEADERS).forEach(function (field) {
      if (DECK_FIELD_HEADERS[field].indexOf(normalized) !== -1) {
        headerIndex[field] = i;
      }
    });
  });

  return values
    .slice(1)
    .filter(function (row) {
      return row.some(function (cell) {
        return cell !== '' && cell !== null;
      });
    })
    .map(function (row) {
      function get(field) {
        return headerIndex[field] !== undefined ? row[headerIndex[field]] : '';
      }
      return {
        cardId: String(get('cardId') || '').trim(),
        pergunta: String(get('pergunta') || '').trim(),
        resposta: String(get('resposta') || '').trim(),
        explicacao: get('explicacao') ? String(get('explicacao')) : undefined,
        categoria: get('categoria') ? String(get('categoria')) : undefined,
      };
    });
}

/**
 * Utilitário administrativo: preenche CardId vazio em cada aba de deck com
 * um id gerado (prefixo do nome do deck + sequencial), ex: ENG-001. Só
 * escreve em células vazias — chamar de novo não duplica nem sobrescreve
 * ids já preenchidos, então é seguro rodar mais de uma vez.
 * Uso: GET ?action=fillMissingCardIds&key=...
 */
function handleFillMissingCardIds_() {
  const filled = [];

  getDeckSheets_().forEach(function (sheet) {
    const deckName = sheet.getName();
    const values = sheet.getDataRange().getValues();
    if (values.length < 2) return;

    let cardIdCol = -1;
    values[0].forEach(function (header, i) {
      if (normalize_(header) === 'cardid') cardIdCol = i;
    });
    if (cardIdCol === -1) return;

    const prefix = buildDeckPrefix_(deckName);
    let counter = 1;
    for (let r = 1; r < values.length; r++) {
      const existing = String(values[r][cardIdCol] || '').trim();
      const match = existing.match(new RegExp('^' + prefix + '-(\\d+)$'));
      if (match) counter = Math.max(counter, Number(match[1]) + 1);
    }

    for (let r = 1; r < values.length; r++) {
      const row = values[r];
      const hasContent = row.some(function (cell) {
        return cell !== '' && cell !== null;
      });
      if (!hasContent) continue;

      const existing = String(row[cardIdCol] || '').trim();
      if (existing) continue;

      const cardId = prefix + '-' + String(counter).padStart(3, '0');
      counter++;
      sheet.getRange(r + 1, cardIdCol + 1).setValue(cardId);
      filled.push({ deck: deckName, row: r + 1, cardId: cardId });
    }
  });

  return { success: true, filled: filled, count: filled.length };
}

function buildDeckPrefix_(deckName) {
  const letters = normalize_(deckName).replace(/[^a-z]/g, '');
  return (letters.slice(0, 3) || 'dck').toUpperCase();
}

function handleGetAll_() {
  const errors = [];
  const flashcards = [];

  getDeckSheets_().forEach(function (sheet) {
    const deckName = sheet.getName();
    readDeckCards_(sheet).forEach(function (card) {
      if (!card.cardId || !card.pergunta || !card.resposta) {
        errors.push({
          cardId: card.cardId || undefined,
          field: !card.cardId ? 'cardId' : !card.pergunta ? 'pergunta' : 'resposta',
          message: 'Campo obrigatório ausente no deck "' + deckName + '" (linha ' + (card.cardId || '(sem id)') + ')',
        });
        return;
      }
      flashcards.push({
        cardId: card.cardId,
        deckName: deckName,
        pergunta: card.pergunta,
        resposta: card.resposta,
        explicacao: card.explicacao,
        categoria: card.categoria,
      });
    });
  });

  const deckTotals = {};
  flashcards.forEach(function (card) {
    deckTotals[card.deckName] = (deckTotals[card.deckName] || 0) + 1;
  });
  const decks = Object.keys(deckTotals).map(function (name) {
    return { name: name, totalCards: deckTotals[name] };
  });

  const metadata = updateMetadata_(flashcards);

  return {
    success: true,
    data: { decks: decks, flashcards: flashcards, metadata: metadata },
    validation: {
      hasErrors: errors.length > 0,
      hasWarnings: false,
      errors: errors,
      warnings: [],
    },
    timestamp: new Date().toISOString(),
  };
}

function updateMetadata_(flashcards) {
  const sheet = getOrCreateSheet_('Metadata', ['deck', 'version', 'updatedAt', 'contentHash']);
  const values = sheet.getDataRange().getValues();
  const existingByDeck = {};
  values.slice(1).forEach(function (row) {
    existingByDeck[row[0]] = { version: row[1], updatedAt: row[2], contentHash: row[3] };
  });

  const byDeck = {};
  flashcards.forEach(function (card) {
    (byDeck[card.deckName] = byDeck[card.deckName] || []).push(card);
  });

  const now = new Date().toISOString();
  const result = [];
  const rows = [];

  Object.keys(byDeck).forEach(function (deckName) {
    const cards = byDeck[deckName]
      .slice()
      .sort(function (a, b) {
        return a.cardId.localeCompare(b.cardId);
      });
    const contentHash = computeHash_(JSON.stringify(cards));
    const previous = existingByDeck[deckName];

    let version = 1;
    let updatedAt = now;
    if (previous) {
      version = Number(previous.version) || 1;
      updatedAt = previous.updatedAt || now;
      if (previous.contentHash !== contentHash) {
        version += 1;
        updatedAt = now;
      }
    }

    result.push({ deck: deckName, version: version, updatedAt: updatedAt });
    rows.push([deckName, version, updatedAt, contentHash]);
  });

  const rowsToClear = sheet.getLastRow() - 1;
  if (rowsToClear > 0) {
    sheet.getRange(2, 1, rowsToClear, 4).clearContent();
  }
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 4).setValues(rows);
  }

  return result;
}

function computeHash_(text) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, text, Utilities.Charset.UTF_8);
  return digest
    .map(function (byte) {
      return (byte < 0 ? byte + 256 : byte).toString(16).padStart(2, '0');
    })
    .join('');
}

function handleSaveProgress_(payload) {
  const cardId = String((payload && payload.cardId) || '').trim();
  const status = String((payload && payload.status) || '').trim();
  if (!cardId || !status) {
    return { success: false, error: 'cardId e status são obrigatórios', type: 'bad_request' };
  }

  const sheet = getOrCreateSheet_('Progresso', [
    'cardId',
    'status',
    'reviewCount',
    'lastReviewed',
    'updatedAt',
  ]);
  const values = sheet.getDataRange().getValues();
  const now = new Date().toISOString();
  const lastReviewed = payload.lastReviewed || now;

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === cardId) {
      const reviewCount = (Number(values[i][2]) || 0) + 1;
      sheet.getRange(i + 1, 1, 1, 5).setValues([[cardId, status, reviewCount, lastReviewed, now]]);
      return { success: true, timestamp: now };
    }
  }

  sheet.appendRow([cardId, status, 1, lastReviewed, now]);
  return { success: true, timestamp: now };
}
