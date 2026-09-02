'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const result = await res.json();
      if (result.success) {
        setUser(result.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    const handleAuthChange = () => fetchUser();
    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        setUser(null);
        window.dispatchEvent(new Event('auth-change'));
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 flex items-center justify-between px-6 h-16 glass-header border-b border-outline-variant/60">
      <div className="flex items-center gap-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <span className="relative">
            <span className="material-symbols-outlined text-primary text-[26px]">bug_report</span>
            <span className="absolute -top-0.5 -right-0.5 block h-2 w-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-white"></span>
          </span>
          <span className="font-headline-md text-headline-md text-primary tracking-tight">
            พิพิธภัณฑ์แมลง
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className={`font-body-md text-body-md transition-colors duration-150 px-3 py-1.5 rounded-md ${pathname === '/' ? 'text-primary font-semibold bg-primary/8' : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
              }`}
          >
            คลังข้อมูลแมลง
          </Link>

          {user && user.role === 'admin' && (
            <Link
              href="/admin"
              className={`font-body-md text-body-md transition-colors duration-150 px-3 py-1.5 rounded-md ${pathname === '/admin' ? 'text-primary font-semibold bg-primary/8' : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
                }`}
            >
              แผงควบคุมผู้ดูแล
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!loading && (
          user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-primary/20 bg-primary/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-body-sm font-semibold leading-none text-on-surface">{user.username}</p>
                  <p className="text-[10px] font-label-caps text-secondary leading-none mt-1 capitalize">{user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักวิจัย'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 border border-outline-variant text-secondary font-label-caps text-label-caps rounded-md hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 text-on-primary font-label-caps text-label-caps rounded-lg shadow-sm hover:shadow-md transition-all duration-150"
              style={{ background: 'linear-gradient(135deg, #006948 0%, #00855d 100%)' }}
            >
              เข้าสู่ระบบ
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
