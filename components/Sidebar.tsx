'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSidebar } from '@/lib/SidebarContext';

interface NavItem {
  page: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { page: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
  { page: 'klanten', icon: 'fas fa-users', label: 'Klanten' },
  { page: 'afspraken', icon: 'fas fa-calendar-alt', label: 'Afspraken' },
  { page: 'uitgaven', icon: 'fas fa-receipt', label: 'Uitgaven' },
  { page: 'terugbetaling', icon: 'fas fa-exclamation-triangle', label: 'Terugbetaling' },
  { page: 'instellingen', icon: 'fas fa-cog', label: 'Instellingen' },
];

const avatarSize = 40;

export default function Sidebar() {
  const pathname = usePathname();
  const currentPage = pathname?.split('/')[1] || 'dashboard';
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [avatarError, setAvatarError] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  return (
    <>
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>
          <i className="fas fa-chart-line"></i> Diëtist Noor
        </h2>
      </div>
      <ul className="nav-menu">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <li key={item.page}>
              <Link
                href={`/${item.page}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="sidebar-account">
        <div className="account-info">
          <span
            className="account-avatar header-avatar-wrap"
            style={{ position: 'relative', display: 'inline-flex', width: avatarSize, height: avatarSize, flexShrink: 0 }}
          >
            {!avatarLoaded && !avatarError && (
              <i className="fas fa-user-circle" style={{ position: 'absolute', inset: 0, fontSize: avatarSize, color: '#cbd5e0', lineHeight: 1 }} aria-hidden />
            )}
            {avatarError ? (
              <i className="fas fa-user-circle" style={{ fontSize: avatarSize, color: '#cbd5e0', lineHeight: 1 }} />
            ) : (
              <Image
                src="/profile.webp"
                alt="Noor"
                width={avatarSize}
                height={avatarSize}
                unoptimized
                onLoad={() => setAvatarLoaded(true)}
                onError={() => setAvatarError(true)}
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  position: 'relative',
                  zIndex: 1,
                  opacity: avatarLoaded ? 1 : 0,
                }}
                className="header-avatar"
              />
            )}
          </span>
          <div className="account-details">
            <div className="account-name">Noor</div>
            <div className="account-role">Diëtist</div>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}
