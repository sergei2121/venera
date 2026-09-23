import React from 'react';

interface ToolbarProps {
  readOnly: boolean;
  onBold: () => void;
  onItalic: () => void;
  onColorChange: (color: string) => void;
  onBgColorChange: (color: string) => void;
  onClearCell: () => void;
}

export default function Toolbar({ readOnly, onBold, onItalic, onColorChange, onBgColorChange, onClearCell }: ToolbarProps) {
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showBgPicker, setShowBgPicker] = React.useState(false);

  const colors = [
    '#000000', '#ff0000', '#00aa00', '#0000ff', '#ff6600',
    '#800080', '#008080', '#808000', '#ff69b4', '#4b0082',
  ];

  const bgColors = [
    'transparent', '#ffff00', '#ff9999', '#99ff99', '#9999ff',
    '#ffcc99', '#cc99ff', '#99ffff', '#ff99cc', '#cccccc',
  ];

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border-b border-gray-200 flex-wrap">
      {!readOnly && (
        <>
          <button
            onClick={onBold}
            className="px-2.5 py-1 text-sm font-bold rounded hover:bg-gray-200 transition-colors"
            title="Жирный"
          >
            B
          </button>
          <button
            onClick={onItalic}
            className="px-2.5 py-1 text-sm italic rounded hover:bg-gray-200 transition-colors"
            title="Курсив"
          >
            I
          </button>

          <div className="relative">
            <button
              onClick={() => { setShowColorPicker(!showColorPicker); setShowBgPicker(false); }}
              className="px-2.5 py-1 text-sm rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
              title="Цвет текста"
            >
              <span className="text-red-500 font-bold">A</span>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 grid grid-cols-5 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => { onColorChange(color); setShowColorPicker(false); }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowBgPicker(!showBgPicker); setShowColorPicker(false); }}
              className="px-2.5 py-1 text-sm rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
              title="Цвет фона"
            >
              <span className="bg-yellow-200 px-1 text-xs font-bold">A</span>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {showBgPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 grid grid-cols-5 gap-1">
                {bgColors.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color === 'transparent' ? '#fff' : color, backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)' : 'none', backgroundSize: '8px 8px', backgroundPosition: '0 0, 4px 4px' }}
                    onClick={() => { onBgColorChange(color); setShowBgPicker(false); }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <button
            onClick={onClearCell}
            className="px-2.5 py-1 text-sm rounded hover:bg-gray-200 transition-colors text-gray-600"
            title="Очистить ячейку"
          >
            🗑️
          </button>
        </>
      )}

      <div className="ml-auto text-xs text-gray-400">
        {readOnly ? '🔒 Режим просмотра' : '✏️ Режим редактирования'}
      </div>
    </div>
  );
}
