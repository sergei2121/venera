import React, { useState } from 'react';
import { SheetData } from '../types';

interface SheetTabsProps {
  sheets: SheetData[];
  activeSheetId: string;
  onSelectSheet: (id: string) => void;
  onAddSheet: () => void;
  onRenameSheet: (id: string, name: string) => void;
  onDeleteSheet: (id: string) => void;
  readOnly: boolean;
}

export default function SheetTabs({ sheets, activeSheetId, onSelectSheet, onAddSheet, onRenameSheet, onDeleteSheet, readOnly }: SheetTabsProps) {
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleDoubleClick = (sheet: SheetData) => {
    if (readOnly) return;
    setEditingTab(sheet.id);
    setEditName(sheet.name);
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      onRenameSheet(id, editName.trim());
    }
    setEditingTab(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleRename(id);
    } else if (e.key === 'Escape') {
      setEditingTab(null);
    }
  };

  return (
    <div className="flex items-center bg-gray-100 border-t border-gray-200 px-2 py-1 overflow-x-auto">
      {sheets.map((sheet) => (
        <div
          key={sheet.id}
          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-t cursor-pointer select-none transition-colors mr-0.5
            ${sheet.id === activeSheetId
              ? 'bg-white border border-gray-300 border-b-white font-medium text-gray-800 -mb-px'
              : 'text-gray-600 hover:bg-gray-200'
            }
          `}
          onClick={() => onSelectSheet(sheet.id)}
          onDoubleClick={() => handleDoubleClick(sheet)}
        >
          {editingTab === sheet.id ? (
            <input
              type="text"
              className="text-sm px-1 py-0 border border-blue-400 rounded outline-none w-20"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => handleRename(sheet.id)}
              onKeyDown={(e) => handleKeyDown(e, sheet.id)}
              autoFocus
            />
          ) : (
            <span>{sheet.name}</span>
          )}
          {!readOnly && sheets.length > 1 && (
            <button
              className="ml-1 text-gray-400 hover:text-red-500 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Удалить лист "${sheet.name}"?`)) {
                  onDeleteSheet(sheet.id);
                }
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}

      {!readOnly && (
        <button
          className="flex items-center justify-center w-7 h-7 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors ml-1"
          onClick={onAddSheet}
          title="Добавить лист"
        >
          +
        </button>
      )}
    </div>
  );
}
