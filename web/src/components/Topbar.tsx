import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Search, Bell } from 'lucide-react';
import './Topbar.css';

export function Topbar() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');

  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={20} />
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="topbar-actions">
        <button className="topbar-notification">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        <div className="topbar-user">
          <div className="user-avatar">
            {user?.first_name?.[0] || user?.username?.[0] || 'U'}
          </div>
          <span className="user-name">
            {user?.first_name || user?.username}
          </span>
        </div>
      </div>
    </header>
  );
}