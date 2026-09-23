import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SheetData, CellData } from '../types';
import { getCellKey, getColLetter, isUrl, normalizeUrl } from '../store';

interface SpreadsheetProps {
  sheet: SheetData;
  onCellChange: (row: number, col: number, data: CellData) => void;
  onColResize: (col: number, width: number) => void;
  onCellSelect?: (row: number, col: number) => void;
  readOnly: boolean;
  showGridLines: boolean;
}

const ROW_HEIGHT = 28;
const DEFAULT_COL_WIDTH = 120;
const ROW_HEADER_WIDTH = 50;
const COL_HEADER_HEIGHT = 28;
const NUM_ROWS = 50;
const NUM_COLS = 26;

export default function Spreadsheet({ sheet, onCellChange, onColResize, onCellSelect, readOnly, showGridLines }: SpreadsheetProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const getColWidth = useCallback((col: number) => {
    return sheet.colWidths[col] || DEFAULT_COL_WIDTH;
  }, [sheet.colWidths]);

  const handleCellDoubleClick = (row: number, col: number) => {
    if (readOnly) return;
    const key = getCellKey(row, col);
    const cell = sheet.cells[key];
    setEditValue(cell?.value || '');
    setEditingCell(key);
  };

  const handleCellClick = (row: number, col: number) => {
    const key = getCellKey(row, col);
    setSelectedCell(key);
    if (onCellSelect) {
      onCellSelect(row, col);
    }
    if (editingCell && editingCell !== key) {
      // Save current edit
      const cell = sheet.cells[editingCell];
      onCellChange(
        parseInt(editingCell.split('_')[0]),
        parseInt(editingCell.split('_')[1]),
        { ...cell, value: editValue }
      );
      setEditingCell(null);
    }
  };

  const handleInputBlur = () => {
    if (editingCell) {
      const [row, col] = editingCell.split('_').map(Number);
      const cell = sheet.cells[editingCell];
      onCellChange(row, col, { ...cell, value: editValue });
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const handleColResizeStart = (col: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingCol(col);
    setResizeStartX(e.clientX);
    setResizeStartWidth(getColWidth(col));
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingCol !== null) {
        const diff = e.clientX - resizeStartX;
        const newWidth = Math.max(50, resizeStartWidth + diff);
        onColResize(resizingCol, newWidth);
      }
    };

    const handleMouseUp = () => {
      setResizingCol(null);
    };

    if (resizingCol !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingCol, resizeStartX, resizeStartWidth, onColResize]);

  const renderCell = (row: number, col: number) => {
    const key = getCellKey(row, col);
    const cell = sheet.cells[key];
    const isEditing = editingCell === key;
    const isSelected = selectedCell === key;
    const value = cell?.value || '';
    const isLink = isUrl(value);

    const style: React.CSSProperties = {
      width: getColWidth(col),
      minWidth: getColWidth(col),
      height: ROW_HEIGHT,
      fontWeight: cell?.bold ? 'bold' : 'normal',
      fontStyle: cell?.italic ? 'italic' : 'normal',
      color: cell?.color || 'inherit',
      backgroundColor: cell?.bgColor || (isSelected ? '#e8f0fe' : 'transparent'),
    };

    return (
      <div
        key={key}
        className={`cell relative flex items-center px-2 text-sm overflow-hidden whitespace-nowrap text-ellipsis
          ${showGridLines ? 'border-r border-b border-gray-200' : ''}
          ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''}
          ${!readOnly ? 'cursor-cell' : 'cursor-default'}
        `}
        style={style}
        onClick={() => handleCellClick(row, col)}
        onDoubleClick={() => handleCellDoubleClick(row, col)}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="absolute inset-0 w-full h-full px-2 text-sm outline-none border-2 border-blue-500 bg-white z-20"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
          />
        ) : isLink ? (
          <a
            href={normalizeUrl(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {value}
          </a>
        ) : (
          <span className="truncate">{value}</span>
        )}
      </div>
    );
  };

  const totalWidth = Array.from({ length: NUM_COLS }, (_, i) => getColWidth(i)).reduce((a, b) => a + b, 0) + ROW_HEADER_WIDTH;

  return (
    <div ref={containerRef} className="flex-1 overflow-auto bg-white relative">
      {/* Column headers */}
      <div className="sticky top-0 z-20 flex bg-gray-50 border-b border-gray-300" style={{ minWidth: totalWidth }}>
        {/* Row header corner */}
        <div
          className="sticky left-0 z-30 bg-gray-100 border-r border-b border-gray-300 flex items-center justify-center text-xs font-medium text-gray-500"
          style={{ width: ROW_HEADER_WIDTH, minWidth: ROW_HEADER_WIDTH, height: COL_HEADER_HEIGHT }}
        >
        </div>
        {/* Column letters */}
        {Array.from({ length: NUM_COLS }, (_, col) => (
          <div
            key={col}
            className="relative flex items-center justify-center text-xs font-medium text-gray-600 border-r border-b border-gray-300 select-none bg-gray-50"
            style={{ width: getColWidth(col), minWidth: getColWidth(col), height: COL_HEADER_HEIGHT }}
          >
            {getColLetter(col)}
            {/* Resize handle */}
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 z-10"
              onMouseDown={(e) => handleColResizeStart(col, e)}
            />
          </div>
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: NUM_ROWS }, (_, row) => (
        <div key={row} className="flex" style={{ minWidth: totalWidth }}>
          {/* Row number */}
          <div
            className="sticky left-0 z-10 bg-gray-50 border-r border-b border-gray-300 flex items-center justify-center text-xs font-medium text-gray-500 select-none"
            style={{ width: ROW_HEADER_WIDTH, minWidth: ROW_HEADER_WIDTH, height: ROW_HEIGHT }}
          >
            {row + 1}
          </div>
          {/* Cells */}
          {Array.from({ length: NUM_COLS }, (_, col) => renderCell(row, col))}
        </div>
      ))}
    </div>
  );
}
