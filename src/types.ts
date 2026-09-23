export interface CellData {
  value: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  bgColor?: string;
}

export interface SheetData {
  id: string;
  name: string;
  cells: Record<string, CellData>;
  colWidths: Record<string, number>;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'viewer';
  createdAt: string;
}

export interface AppSettings {
  appName: string;
  defaultRows: number;
  defaultCols: number;
  allowViewerEdit: boolean;
  showGridLines: boolean;
  theme: 'light' | 'dark';
}

export interface AppState {
  sheets: SheetData[];
  activeSheetId: string;
  users: User[];
  currentUser: User | null;
  settings: AppSettings;
}
