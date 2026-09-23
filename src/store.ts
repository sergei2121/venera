import { AppState, SheetData, CellData, User, AppSettings } from './types';

const STORAGE_KEY = 'netsheet_data';

const defaultSettings: AppSettings = {
  appName: 'NetSheet',
  defaultRows: 50,
  defaultCols: 26,
  allowViewerEdit: false,
  showGridLines: true,
  theme: 'light',
};

const defaultSheet = (): SheetData => ({
  id: 'sheet_1',
  name: 'Лист 1',
  cells: {
    '0_0': { value: 'NetSheet — Локальная таблица', bold: true, color: '#1a56db' },
    '1_0': { value: 'Проект', bold: true },
    '1_1': { value: 'Статус', bold: true },
    '1_2': { value: 'Ссылка', bold: true },
    '1_3': { value: 'Ответственный', bold: true },
    '2_0': { value: 'Веб-приложение' },
    '2_1': { value: 'В работе' },
    '2_2': { value: 'https://github.com', color: '#1a56db' },
    '2_3': { value: 'Иванов А.А.' },
    '3_0': { value: 'Мобильное приложение' },
    '3_1': { value: 'Планирование' },
    '3_2': { value: 'https://reactjs.org', color: '#1a56db' },
    '3_3': { value: 'Петрова М.И.' },
    '4_0': { value: 'API сервер' },
    '4_1': { value: 'Завершён' },
    '4_2': { value: 'https://nodejs.org', color: '#1a56db' },
    '4_3': { value: 'Сидоров К.В.' },
    '5_0': { value: 'Документация' },
    '5_1': { value: 'В работе' },
    '5_2': { value: 'www.wikipedia.org', color: '#1a56db' },
    '5_3': { value: 'Козлова Е.С.' },
  },
  colWidths: { 0: 180, 1: 140, 2: 180, 3: 160 },
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

export { defaultSettings };
