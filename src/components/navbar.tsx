'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

type NavProfile = {
  role: string | null;
  pro_application_status: string | null;
};

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<NavProfile | null>(null);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    let isActive = true;

    const syncAuth = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!isActive) return;

      if (!user) {
        setIsLoggedIn(false);
        setProfile(null);
        setAuthResolved(true);
        return;
      }

      setIsLoggedIn(true);

      const { data: loadedProfile } = await supabase
        .from('profiles')
        .select('role, pro_application_status')
        .eq('id', user.id)
        .maybeSingle();

      if (!isActive) return;

      setProfile({
        role: loadedProfile?.role ?? null,
        pro_application_status: loadedProfile?.pro_application_status ?? null
      });
      setAuthResolved(true);
    };

    void syncAuth();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      void syncAuth();
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const isProvider = profile?.role === 'provider' || profile?.pro_application_status === 'approved';
  const isAdmin = profile?.role === 'admin';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const isActivePath = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));

  const navLinkClass = (href: string) =>
    `focus-ring rounded-md px-2 py-1.5 text-sm font-medium transition ${
      isActivePath(href) ? 'text-white' : 'text-white/90 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-[var(--red)] text-white shadow-[0_10px_35px_rgba(225,29,46,0.22)]">
      <div className="section-shell flex min-h-[72px] flex-wrap items-center justify-between gap-2 py-2 sm:min-h-[78px] sm:gap-3">
        <Link
          href="/"
          aria-label="I-Kali home"
          className="focus-ring inline-flex items-center rounded-xl"
        >
          <span className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.10)]">
            <span className="text-[1.35rem] font-black leading-none tracking-[-0.06em] text-[var(--red)]">I</span>
            <span className="mx-0.5 text-[1.35rem] font-black leading-none tracking-[-0.06em] text-black">-</span>
            <span className="text-[1.35rem] font-black leading-none tracking-[-0.06em] text-[var(--red)]">Kali</span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <Link href="/services" className={navLinkClass('/services')}>
            Services
          </Link>

          {!authResolved ? null : !isLoggedIn ? (
            <>
              <Link href="/auth" className={navLinkClass('/auth')}>
                Sign in / Sign up
              </Link>
              <Link
                href="/become-a-pro"
                className="focus-ring inline-flex min-h-10 items-center rounded-full bg-black px-3 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-black sm:px-4"
              >
                Become a Pro
              </Link>
            </>
          ) : (
            <>
              <Link href="/account" className={navLinkClass('/account')}>
                Account
              </Link>

              {isProvider && (
                <Link href="/pro" className={navLinkClass('/pro')}>
                  Pro Dashboard
                </Link>
              )}

              {isAdmin && (
                <Link href="/control" className={navLinkClass('/control')}>
                  Control
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="focus-ring rounded-md px-2 py-1.5 text-sm font-medium text-white/90 transition hover:text-white"
              >
                Logout
              </button>

              {!isProvider && (
                <Link
                  href="/become-a-pro"
                  className="focus-ring inline-flex min-h-10 items-center rounded-full bg-black px-3 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-black sm:px-4"
                >
                  Become a Pro
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
