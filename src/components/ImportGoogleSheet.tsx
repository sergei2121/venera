import React, { useState } from 'react';
import { fetchGoogleSheet, extractGoogleSheetId } from '../store';

interface ImportGoogleSheetProps {
  onImport: (data: string[][]) => void;
  onClose: () => void;
}

export default function ImportGoogleSheet({ onImport, onClose }: ImportGoogleSheetProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string[][] | null>(null);

  const handlePreview = async () => {
    setError(null);
    setPreview(null);
    if (!url.trim()) {
      setError('Введите ссылку на Google Таблицу');
      return;
    }

    const sheetId = extractGoogleSheetId(url);
    if (!sheetId) {
      setError('Не удалось распознать ссылку на Google Таблицу');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchGoogleSheet(url);
      if (data.length === 0) {
        setError('Таблица пуста');
        setLoading(false);
        return;
      }
      setPreview(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке таблицы');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (preview) {
      onImport(preview);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            📥 Импорт из Google Таблиц
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>💡 Важно:</strong> Таблица должна быть опубликована с доступом "Все, у кого есть ссылка".
              <br />
              В Google Таблице: <em>Файл → Поделиться → Все, у кого есть ссылка → Читатель</em>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ссылка на Google Таблицу
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePreview()}
              />
              <button
                onClick={handlePreview}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? '⏳ Загрузка...' : '🔍 Предпросмотр'}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span>❌</span> {error}
              </p>
            )}
          </div>

          {preview && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">
                  Предпросмотр ({preview.length} строк × {Math.max(...preview.map(r => r.length))} столбцов)
                </h3>
                <button
                  onClick={handleImport}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  ✅ Импортировать
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-auto max-h-80">
                <table className="w-full text-xs">
                  <tbody>
                    {preview.slice(0, 50).map((row, rowIdx) => (
                      <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-2 py-1 text-gray-400 border-r border-gray-200 text-center w-8 font-mono">
                          {rowIdx + 1}
                        </td>
                        {row.slice(0, 20).map((cell, colIdx) => (
                          <td
                            key={colIdx}
                            className="px-2 py-1 border-r border-gray-100 max-w-[200px] truncate"
                            title={cell}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 50 && (
                  <div className="p-2 text-center text-xs text-gray-500 bg-yellow-50">
                    Показаны первые 50 строк из {preview.length}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500">
            Данные будут импортированы в текущий активный лист, начиная с ячейки A1
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
