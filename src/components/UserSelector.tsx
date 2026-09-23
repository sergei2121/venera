import React, { useState } from 'react';
import { User } from '../types';

interface UserSelectorProps {
  users: User[];
  onSelectUser: (user: User) => void;
  appName: string;
}

export default function UserSelector({ users, onSelectUser, appName }: UserSelectorProps) {
  const [selectedUserId, setSelectedUserId] = useState('');

  const handleLogin = () => {
    const user = users.find(u => u.id === selectedUserId);
    if (user) {
      onSelectUser(user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">📊</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{appName}</h1>
          <p className="text-sm text-gray-500 mt-1">Таблица для совместной работы в локальной сети</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Выберите пользователя</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">— Выберите —</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.role === 'admin' ? '👑' : '👁️'} {user.name}
                  {' '}({user.role === 'admin' ? 'Админ' : 'Просмотр'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleLogin}
            disabled={!selectedUserId}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            Войти
          </button>
        </div>

        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700 text-center">
            💡 Администраторы могут редактировать данные и управлять настройками.
            <br />
            Пользователи с ролью "Просмотр" могут только читать данные.
          </p>
        </div>
      </div>
    </div>
  );
}
