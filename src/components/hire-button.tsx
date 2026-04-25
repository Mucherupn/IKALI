'use client';

import { useRouter } from 'next/navigation';
import { MouseEvent, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

type HireButtonProps = {
  href: string;
  className: string;
  children: React.ReactNode;
};

export function HireButton({ href, className, children }: HireButtonProps) {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const onClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (isCheckingAuth) return;

    setIsCheckingAuth(true);

    try {
      const supabase = getSupabaseClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        router.push(`/login?next=${encodeURIComponent(href)}`);
        return;
      }

      router.push(href);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  return (
    <button type="button" onClick={onClick} className={className} disabled={isCheckingAuth}>
      {isCheckingAuth ? 'Checking account…' : children}
    </button>
  );
}
