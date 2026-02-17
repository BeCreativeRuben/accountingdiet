'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSidebar } from '@/lib/SidebarContext';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const [avatarError, setAvatarError] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  const avatarSize = 32;
  const avatarStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: '50%',
    objectFit: 'cover' as const,
    marginRight: '0.5rem',
  };

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="menu-toggle"
          onClick={toggleSidebar}
        >
          <i className="fas fa-bars"></i>
        </button>
        <h1>{title}</h1>
      </div>
      <div className="header-right">
        <div className="user-info">
          <span
            className="header-avatar-wrap"
            style={{ position: 'relative', display: 'inline-block', width: avatarSize, height: avatarSize, marginRight: '0.5rem' }}
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
                priority
                unoptimized
                onLoad={() => setAvatarLoaded(true)}
                onError={() => setAvatarError(true)}
                style={{ ...avatarStyle, position: 'relative', zIndex: 1, opacity: avatarLoaded ? 1 : 0 }}
                className="header-avatar"
              />
            )}
          </span>
          <span>Noor</span>
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
