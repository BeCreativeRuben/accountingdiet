'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

export default function Sidebar() {
  const pathname = usePathname();
  const currentPage = pathname?.split('/')[1] || 'dashboard';

  return (
    <nav className="sidebar">
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
          <div className="account-avatar">L</div>
          <div className="account-details">
            <div className="account-name">Laura</div>
            <div className="account-role">Diëtist</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
