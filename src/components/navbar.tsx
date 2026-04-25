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

  const isActivePath = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

  const navLinkClass = (href: string) =>
    `focus-ring whitespace-nowrap rounded-md px-1 text-[10px] font-medium tracking-[-0.01em] transition min-[375px]:text-[11px] min-[430px]:px-1.5 min-[430px]:text-xs sm:px-2 sm:text-sm ${
      isActivePath(href) ? 'text-white' : 'text-white/90 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-[var(--red)] text-white shadow-[0_10px_35px_rgba(225,29,46,0.22)]">
      <div className="mx-auto flex min-h-[62px] w-full max-w-[1200px] items-center justify-between gap-1 px-2 py-2 min-[375px]:px-3 sm:min-h-[78px] sm:gap-3 sm:px-4 lg:px-0">
        <Link
          href="/"
          aria-label="I-Kali home"
          className="focus-ring inline-flex shrink-0 items-center rounded-lg"
        >
          <span className="inline-flex items-center rounded-lg bg-white px-2 py-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.10)] min-[375px]:px-2.5 sm:rounded-xl sm:px-4 sm:py-2.5">
            <span className="text-[0.95rem] font-black leading-none tracking-[-0.06em] text-[var(--red)] min-[375px]:text-[1rem] sm:text-[1.35rem]">
              I
            </span>
            <span className="mx-0.5 text-[0.95rem] font-black leading-none tracking-[-0.06em] text-black min-[375px]:text-[1rem] sm:text-[1.35rem]">
              -
            </span>
            <span className="text-[0.95rem] font-black leading-none tracking-[-0.06em] text-[var(--red)] min-[375px]:text-[1rem] sm:text-[1.35rem]">
              Kali
            </span>
          </span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-center gap-1 px-1 min-[430px]:gap-2 sm:gap-7 sm:px-2">
          <Link href="/services" className={navLinkClass('/services')}>
            Services
          </Link>

          {!authResolved ? null : !isLoggedIn ? (
            <Link href="/auth" className={navLinkClass('/auth')}>
              Sign in / Sign up
            </Link>
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
                className="focus-ring whitespace-nowrap rounded-md px-1 text-[10px] font-medium tracking-[-0.01em] text-white/90 transition hover:text-white min-[375px]:text-[11px] min-[430px]:px-1.5 min-[430px]:text-xs sm:px-2 sm:text-sm"
              >
                Logout
              </button>
            </>
          )}
        </nav>

        {authResolved && (!isLoggedIn || !isProvider) ? (
          <Link
            href="/become-a-pro"
            className="focus-ring group inline-flex min-h-8 shrink-0 items-center rounded-full bg-black px-2 text-[10px] font-semibold tracking-[-0.01em] shadow-[0_10px_25px_rgba(0,0,0,0.18)] transition hover:bg-white min-[375px]:px-2.5 min-[375px]:text-[11px] min-[430px]:min-h-9 min-[430px]:px-3 min-[430px]:text-xs sm:min-h-11 sm:px-6 sm:py-3 sm:text-sm"
          >
            <span className="text-white transition group-hover:!text-black">
              Become a Pro
            </span>
          </Link>
        ) : null}
      </div>
    </header>
  );
}