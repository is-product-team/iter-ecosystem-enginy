'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@iter/shared';
import notificationService from '@/services/notificationService';
import { useEffect, useState } from 'react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        try {
          const list = await notificationService.getAll();
          setUnreadCount(list.filter(n => !n.isRead).length);
        } catch (error) {
          console.error("Error fetching notifications for navbar", error);
        }
      };
      fetchUnread();

      const interval = setInterval(fetchUnread, 120000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!user) return null;

  const isAdmin = user.role.name === ROLES.ADMIN;
  const isCoordinator = user.role.name === ROLES.COORDINATOR;

  const getHomePath = () => {
    if (isAdmin) return `/admin`;
    if (isCoordinator) return `/center`;
    return `/`;
  };

  const navLinks = [
    { label: 'Home', path: getHomePath(), show: true },
    { label: 'Notifications', path: `/center/notifications`, show: true, isNotifications: true },
    { label: 'Calendar', path: `/calendar`, show: true },
    { label: 'Profile', path: `/profile`, show: true },
  ];

  return (
    <div className="sticky top-0 z-50 bg-background-surface/80 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-[1440px] mx-auto container-responsive">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={getHomePath()} className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="Iter Logo" 
                width={40}
                height={40}
                className="w-10 h-10 object-contain block dark:hidden" 
              />
              <Image 
                src="/logo-invers.png" 
                alt="Iter Logo" 
                width={40}
                height={40}
                className="w-10 h-10 object-contain hidden dark:block" 
              />
            </Link>
          </div>

          <div className="flex items-center">
            <nav className="hidden md:flex items-center h-full mr-8">
              {navLinks.filter(link => link.show).map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`h-full flex items-center px-4 text-[13px] font-medium transition-all border-b-2 ${
                    pathname === link.path 
                      ? 'border-consorci-darkBlue text-text-primary' 
                      : 'border-transparent text-text-muted hover:text-text-primary'
                  }`}
                >
                  <span className="relative">
                    {link.label}
                    {link.isNotifications && unreadCount > 0 && (
                      <span className="absolute -top-3 -right-4 flex h-4 w-4">
                        <span className="relative inline-flex h-4 w-4 bg-consorci-pinkRed text-[9px] font-medium items-center justify-center text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      </span>
                    )}
                  </span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center border-l border-border-subtle pl-8 h-8 my-auto gap-6">
              <div className="flex flex-col items-end">
                <span className="text-text-primary text-[13px] font-medium mb-0.5">
                  {user?.fullName || ''}
                </span>
                <span className="text-text-secondary text-[11px] font-normal">
                  {user?.center?.name || 'Educational center'}
                </span>
                <span className="text-[11px] font-normal text-text-muted mt-0.5 truncate max-w-[180px]">
                  {user?.role?.name} {user?.center?.centerCode ? `• ${user.center.centerCode}` : ''}
                </span>
              </div>
              <button
                onClick={logout}
                className="bg-consorci-darkBlue hover:bg-consorci-actionBlue text-white text-[12px] font-medium px-5 py-2 transition-all active:scale-[0.98]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
