'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <i className="fas fa-bars"></i>
        </button>
        <h1>{title}</h1>
      </div>
      <div className="header-right">
        <div className="user-info">
          <i className="fas fa-user-circle"></i>
          <span>Laura</span>
          <button
            className="btn btn-sm btn-secondary"
            onClick={handleLogout}
            style={{ marginLeft: '1rem' }}
          >
            <i className="fas fa-sign-out-alt"></i> Uitloggen
          </button>
        </div>
      </div>
    </header>
  );
}
