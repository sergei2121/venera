import React, { useState, useCallback, useEffect } from 'react';
import { AppState, CellData, User } from './types';
import { loadState, saveState, generateId, getCellKey } from './store';
import Spreadsheet from './components/Spreadsheet';
import Toolbar from './components/Toolbar';
import SheetTabs from './components/SheetTabs';
import AdminPanel from './components/AdminPanel';
import UserSelector from './components/UserSelector';

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedCellKey, setSelectedCellKey] = useState<string | null>(null);

  // Save state on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const isReadOnly = state.currentUser?.role === 'viewer' && !state.settings.allowViewerEdit;

  const activeSheet = state.sheets.find(s => s.id === state.activeSheetId) || state.sheets[0];

  // Cell operations
  const handleCellChange = useCallback((row: number, col: number, data: CellData) => {
    if (isReadOnly) return;
    const key = getCellKey(row, col);
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.activeSheetId
          ? { ...sheet, cells: { ...sheet.cells, [key]: { ...sheet.cells[key], ...data, value: data.value !== undefined ? data.value : sheet.cells[key]?.value || '' } } }
          : sheet
      ),
    }));
  }, [isReadOnly]);

  const handleColResize = useCallback((col: number, width: number) => {
    if (isReadOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === prev.activeSheetId
          ? { ...sheet, colWidths: { ...sheet.colWidths, [col]: width } }
          : sheet
      ),
    }));
  }, [isReadOnly]);

  // Sheet operations
  const handleAddSheet = useCallback(() => {
    if (isReadOnly) return;
    const newSheet = {
      id: generateId('sheet'),
      name: `Лист ${state.sheets.length + 1}`,
      cells: {},
      colWidths: {},
    };
    setState(prev => ({
      ...prev,
      sheets: [...prev.sheets, newSheet],
      activeSheetId: newSheet.id,
    }));
  }, [state.sheets.length, isReadOnly]);

  const handleSelectSheet = useCallback((id: string) => {
    setState(prev => ({ ...prev, activeSheetId: id }));
  }, []);

  const handleRenameSheet = useCallback((id: string, name: string) => {
    if (isReadOnly) return;
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(sheet =>
        sheet.id === id ? { ...sheet, name } : sheet
      ),
    }));
  }, [isReadOnly]);

  const handleDeleteSheet = useCallback((id: string) => {
    if (isReadOnly) return;
    setState(prev => {
      const newSheets = prev.sheets.filter(s => s.id !== id);
      const newActiveId = prev.activeSheetId === id ? newSheets[0]?.id : prev.activeSheetId;
      return { ...prev, sheets: newSheets, activeSheetId: newActiveId };
    });
  }, [isReadOnly]);

  // Toolbar formatting
  const handleBold = useCallback(() => {
    if (isReadOnly || !selectedCellKey) return;
    setState(prev => {
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId);
      if (!sheet) return prev;
      const cell = sheet.cells[selectedCellKey] || { value: '' };
      return {
        ...prev,
        sheets: prev.sheets.map(s =>
          s.id === prev.activeSheetId
            ? { ...s, cells: { ...s.cells, [selectedCellKey]: { ...cell, bold: !cell.bold } } }
            : s
        ),
      };
    });
  }, [isReadOnly, selectedCellKey]);

  const handleItalic = useCallback(() => {
    if (isReadOnly || !selectedCellKey) return;
    setState(prev => {
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId);
      if (!sheet) return prev;
      const cell = sheet.cells[selectedCellKey] || { value: '' };
      return {
        ...prev,
        sheets: prev.sheets.map(s =>
          s.id === prev.activeSheetId
            ? { ...s, cells: { ...s.cells, [selectedCellKey]: { ...cell, italic: !cell.italic } } }
            : s
        ),
      };
    });
  }, [isReadOnly, selectedCellKey]);

  const handleColorChange = useCallback((color: string) => {
    if (isReadOnly || !selectedCellKey) return;
    setState(prev => {
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId);
      if (!sheet) return prev;
      const cell = sheet.cells[selectedCellKey] || { value: '' };
      return {
        ...prev,
        sheets: prev.sheets.map(s =>
          s.id === prev.activeSheetId
            ? { ...s, cells: { ...s.cells, [selectedCellKey]: { ...cell, color } } }
            : s
        ),
      };
    });
  }, [isReadOnly, selectedCellKey]);

  const handleBgColorChange = useCallback((color: string) => {
    if (isReadOnly || !selectedCellKey) return;
    setState(prev => {
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId);
      if (!sheet) return prev;
      const cell = sheet.cells[selectedCellKey] || { value: '' };
      return {
        ...prev,
        sheets: prev.sheets.map(s =>
          s.id === prev.activeSheetId
            ? { ...s, cells: { ...s.cells, [selectedCellKey]: { ...cell, bgColor: color === 'transparent' ? undefined : color } } }
            : s
        ),
      };
    });
  }, [isReadOnly, selectedCellKey]);

  const handleClearCell = useCallback(() => {
    if (isReadOnly || !selectedCellKey) return;
    setState(prev => {
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId);
      if (!sheet) return prev;
      const newCells = { ...sheet.cells };
      delete newCells[selectedCellKey];
      return {
        ...prev,
        sheets: prev.sheets.map(s =>
          s.id === prev.activeSheetId ? { ...s, cells: newCells } : s
        ),
      };
    });
  }, [isReadOnly, selectedCellKey]);

  // User management
  const handleSelectUser = useCallback((user: User) => {
    setState(prev => ({ ...prev, currentUser: user }));
  }, []);

  const handleLogout = useCallback(() => {
    setState(prev => ({ ...prev, currentUser: null }));
  }, []);

  const handleAddUser = useCallback((user: User) => {
    setState(prev => ({ ...prev, users: [...prev.users, user] }));
  }, []);

  const handleDeleteUser = useCallback((id: string) => {
    setState(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
  }, []);

  const handleUpdateSettings = useCallback((settings: typeof state.settings) => {
    setState(prev => ({ ...prev, settings }));
  }, []);

  // Track selected cell from spreadsheet
  const handleSpreadsheetCellClick = useCallback((row: number, col: number) => {
    setSelectedCellKey(getCellKey(row, col));
  }, []);

  // If no user selected, show login
  if (!state.currentUser) {
    return (
      <UserSelector
        users={state.users}
        onSelectUser={handleSelectUser}
        appName={state.settings.appName}
      />
    );
  }

  const darkMode = state.settings.theme === 'dark';

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-4 py-2 border-b ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-sm`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow">
            <span className="text-lg">📊</span>
          </div>
          <div>
            <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {state.settings.appName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Current user info */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
              state.currentUser.role === 'admin' ? 'bg-purple-500' : 'bg-green-500'
            }`}>
              {state.currentUser.name.charAt(0).toUpperCase()}
            </div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {state.currentUser.name}
            </span>
            {state.currentUser.role === 'admin' && (
              <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Admin</span>
            )}
          </div>

          {/* Admin button */}
          {state.currentUser.role === 'admin' && (
            <button
              onClick={() => setShowAdmin(true)}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
            >
              ⚙️ Настройки
            </button>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Выйти
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar
        readOnly={isReadOnly}
        onBold={handleBold}
        onItalic={handleItalic}
        onColorChange={handleColorChange}
        onBgColorChange={handleBgColorChange}
        onClearCell={handleClearCell}
      />

      {/* Formula bar */}
      <div className={`flex items-center px-3 py-1 border-b text-sm ${
        darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
      }`}>
        <span className="font-mono text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded mr-2 min-w-[40px] text-center">
          {selectedCellKey ? (() => {
            const [r, c] = selectedCellKey.split('_').map(Number);
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            return letters[c] + (r + 1);
          })() : '—'}
        </span>
        <span className="font-mono text-xs text-gray-400 mr-2">fx</span>
        <span className="truncate">
          {selectedCellKey && activeSheet.cells[selectedCellKey]?.value
            ? activeSheet.cells[selectedCellKey].value
            : ''}
        </span>
      </div>

      {/* Spreadsheet */}
      <Spreadsheet
        sheet={activeSheet}
        onCellChange={handleCellChange}
        onColResize={handleColResize}
        onCellSelect={handleSpreadsheetCellClick}
        readOnly={isReadOnly}
        showGridLines={state.settings.showGridLines}
      />

      {/* Sheet tabs */}
      <SheetTabs
        sheets={state.sheets}
        activeSheetId={state.activeSheetId}
        onSelectSheet={handleSelectSheet}
        onAddSheet={handleAddSheet}
        onRenameSheet={handleRenameSheet}
        onDeleteSheet={handleDeleteSheet}
        readOnly={isReadOnly}
      />

      {/* Status bar */}
      <div className={`flex items-center justify-between px-4 py-1 text-xs border-t ${
        darkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
      }`}>
        <span>
          Листов: {state.sheets.length} | Ячеек с данными: {Object.keys(activeSheet.cells).filter(k => activeSheet.cells[k]?.value).length}
        </span>
        <span>
          {state.settings.appName} • {new Date().toLocaleDateString('ru-RU')}
        </span>
      </div>

      {/* Admin Panel Modal */}
      {showAdmin && state.currentUser.role === 'admin' && (
        <AdminPanel
          users={state.users}
          settings={state.settings}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
}
