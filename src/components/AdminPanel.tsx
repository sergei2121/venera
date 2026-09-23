import React, { useState } from 'react';
import { User, AppSettings } from '../types';
import { generateId } from '../store';

interface AdminPanelProps {
  users: User[];
  settings: AppSettings;
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onClose: () => void;
}

export default function AdminPanel({ users, settings, onAddUser, onDeleteUser, onUpdateSettings, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
  const [newUserName, setNewUserName] = useState('');
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });

  const handleAddViewer = () => {
    if (!newUserName.trim()) return;
    const user: User = {
      id: generateId('user'),
      name: newUserName.trim(),
      role: 'viewer',
      createdAt: new Date().toISOString(),
    };
    onAddUser(user);
    setNewUserName('');
  };

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            ⚙️ Админ-панель
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('users')}
          >
            👥 Пользователи
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            🔧 Настройки
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Добавить пользователя (только просмотр)</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Имя пользователя..."
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddViewer()}
                  />
                  <button
                    onClick={handleAddViewer}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Добавить
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Пользователи без пароля — только для просмотра данных
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">Список пользователей</h3>
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        user.role === 'admin' ? 'bg-purple-500' : 'bg-green-500'
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{user.name}</div>
                        <div className="text-xs text-gray-500">
                          {user.role === 'admin' ? '👑 Администратор' : '👁️ Только просмотр'}
                          {' • '}
                          {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </div>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => {
                          if (confirm(`Удалить пользователя "${user.name}"?`)) {
                            onDeleteUser(user.id);
                          }
                        }}
                        className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название приложения</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={localSettings.appName}
                  onChange={(e) => setLocalSettings({ ...localSettings, appName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Строк по умолчанию</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={localSettings.defaultRows}
                    onChange={(e) => setLocalSettings({ ...localSettings, defaultRows: parseInt(e.target.value) || 50 })}
                    min={10}
                    max={500}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Столбцов по умолчанию</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={localSettings.defaultCols}
                    onChange={(e) => setLocalSettings({ ...localSettings, defaultCols: parseInt(e.target.value) || 26 })}
                    min={5}
                    max={52}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    checked={localSettings.showGridLines}
                    onChange={(e) => setLocalSettings({ ...localSettings, showGridLines: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">Показывать сетку</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    checked={localSettings.allowViewerEdit}
                    onChange={(e) => setLocalSettings({ ...localSettings, allowViewerEdit: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">Разрешить просмотрщикам редактировать</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Тема оформления</label>
                <div className="flex gap-3">
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      localSettings.theme === 'light'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setLocalSettings({ ...localSettings, theme: 'light' })}
                  >
                    ☀️ Светлая
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      localSettings.theme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setLocalSettings({ ...localSettings, theme: 'dark' })}
                  >
                    🌙 Тёмная
                  </button>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full px-4 py-2.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                💾 Сохранить настройки
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
