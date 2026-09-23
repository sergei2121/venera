import { AppState, SheetData, CellData, User, AppSettings } from './types';

const STORAGE_KEY = 'netsheet_data';

const defaultSettings: AppSettings = {
  appName: 'Все ЖК',
  defaultRows: 50,
  defaultCols: 26,
  allowViewerEdit: false,
  showGridLines: true,
  theme: 'light',
};

const defaultSheet = (): SheetData => ({
  id: 'sheet_1',
  name: 'ЖК Список',
  cells: {
    '0_0': { value: 'Все ЖК — Реестр жилых комплексов', bold: true, color: '#1a56db' },
    '1_0': { value: 'Название ЖК', bold: true },
    '1_1': { value: 'Застройщик', bold: true },
    '1_2': { value: 'Адрес', bold: true },
    '1_3': { value: 'Сайт', bold: true },
    '1_4': { value: 'Статус', bold: true },
    '2_0': { value: 'ЖК Солнечный' },
    '2_1': { value: 'Группа ЛСР' },
    '2_2': { value: 'ул. Ленина, 15' },
    '2_3': { value: 'https://example-solar.ru', color: '#1a56db' },
    '2_4': { value: 'Сдан' },
    '3_0': { value: 'ЖК Парковый' },
    '3_1': { value: 'ПИК' },
    '3_2': { value: 'пр. Мира, 42' },
    '3_3': { value: 'https://example-park.ru', color: '#1a56db' },
    '3_4': { value: 'Строится' },
    '4_0': { value: 'ЖК Речной' },
    '4_1': { value: 'Самолёт' },
    '4_2': { value: 'наб. реки, 7' },
    '4_3': { value: 'https://example-river.ru', color: '#1a56db' },
    '4_4': { value: 'Проектирование' },
    '5_0': { value: 'ЖК Центральный' },
    '5_1': { value: 'Эталон' },
    '5_2': { value: 'ул. Центральная, 1' },
    '5_3': { value: 'https://example-center.ru', color: '#1a56db' },
    '5_4': { value: 'Сдан' },
  },
  colWidths: { 0: 180, 1: 150, 2: 180, 3: 200, 4: 140 },
});

const defaultAdmin: User = {
  id: 'admin_1',
  name: 'Администратор',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

const defaultState: AppState = {
  sheets: [defaultSheet()],
  activeSheetId: 'sheet_1',
  users: [defaultAdmin],
  currentUser: defaultAdmin,
  settings: defaultSettings,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      // Ensure all required fields exist
      if (!parsed.settings) parsed.settings = defaultSettings;
      if (!parsed.users) parsed.users = [defaultAdmin];
      if (!parsed.currentUser) parsed.currentUser = defaultAdmin;
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return defaultState;
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getCellKey(row: number, col: number): string {
  return `${row}_${col}`;
}

export function getColLetter(col: number): string {
  let result = '';
  let num = col;
  while (num >= 0) {
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26) - 1;
  }
  return result;
}

export function isUrl(text: string): boolean {
  const urlPattern = /^(https?:\/\/|www\.)[^\s]+$/i;
  return urlPattern.test(text.trim());
}

export function normalizeUrl(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('www.')) {
    return 'https://' + trimmed;
  }
  return trimmed;
}

/**
 * Извлекает ID таблицы Google Sheets из URL.
 * Поддерживает форматы:
 *  - https://docs.google.com/spreadsheets/d/ID/edit
 *  - https://docs.google.com/spreadsheets/d/ID/html
 *  - https://docs.google.com/spreadsheets/d/ID/export?format=csv
 *  - https://docs.google.com/spreadsheets/d/ID
 *  - Просто ID (строка 44 символа)
 */
export function extractGoogleSheetId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Попытка извлечь из URL
  const urlPattern = /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/;
  const match = trimmed.match(urlPattern);
  if (match && match[1]) {
    return match[1];
  }

  // Если это просто ID (длинная строка без пробелов)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Парсит CSV-строку в массив массивов строк.
 * Поддерживает кавычки, экранированные кавычки, переносы строк внутри кавычек.
 */
export function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < csv.length) {
    const char = csv[i];
    const next = csv[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        currentField += '"';
        i += 2;
        continue;
      } else if (char === '"') {
        inQuotes = false;
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
        i++;
        continue;
      } else if (char === '\r') {
        // Игнорируем \r, обрабатываем \n
        i++;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  // Последнее поле/строка
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Загружает публичную Google Таблицу по ссылке и возвращает данные в виде массива строк.
 * Использует публичный endpoint gviz (не требует API ключа).
 */
export async function fetchGoogleSheet(url: string): Promise<string[][]> {
  const sheetId = extractGoogleSheetId(url);
  if (!sheetId) {
    throw new Error('Не удалось извлечь ID таблицы из ссылки');
  }

  // Пробуем получить CSV через gviz endpoint
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error(`Ошибка загрузки таблицы: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();

  // Проверка на ошибку Google (иногда возвращает HTML)
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    throw new Error('Таблица не является публичной или ссылка некорректна');
  }

  return parseCsv(text);
}

export { defaultSettings };
