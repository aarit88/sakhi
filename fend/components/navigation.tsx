'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  Box,
  CalendarCheck2,
  FileText,
  Heart,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Stethoscope,
  User,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard', icon: Activity },
  { href: '/body-map', label: '3D Body Map', icon: Box },
  { href: '/clinical-reports', label: 'Reports', icon: FileText },
  { href: '/ayurveda', label: 'Ayurveda', icon: Leaf },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/care-finder', label: 'Care Finder', icon: MapPin },
  { href: '/doctor-portal', label: 'Doctor Portal', icon: Stethoscope },
  { href: '/workspace', label: 'Workspace', icon: CalendarCheck2 },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-rose-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm">
            <Heart className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            SAKHI
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-rose-50 text-rose-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/anonymous-chat"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
              pathname === '/anonymous-chat'
                ? 'bg-teal-50 text-teal-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Anon Chat
          </Link>
        </nav>

        {/* Right User Actions */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/profile')}
                className="text-slate-700 hover:bg-slate-100"
              >
                <User className="h-4 w-4 mr-1.5 text-rose-600" />
                <span className="max-w-[110px] truncate text-xs font-medium">
                  {user?.name || user?.email?.split('@')[0] || 'Profile'}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs"
              >
                <LogOut className="h-3.5 w-3.5 mr-1" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => router.push('/signup')}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {[...NAV_LINKS, { href: '/anonymous-chat', label: 'Anonymous Chat', icon: MessageCircle }].map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  active ? 'bg-rose-50 text-rose-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Button variant="outline" size="sm" onClick={() => { setIsOpen(false); router.push('/profile'); }}>
                  <User className="h-4 w-4 mr-2" /> Profile & Consents
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setIsOpen(false); logout(); }} className="text-rose-700 border-rose-200">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => { setIsOpen(false); router.push('/login'); }}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => { setIsOpen(false); router.push('/signup'); }} className="bg-rose-600 text-white">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
