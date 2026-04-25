'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

export default function BecomeAProPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadSession() {
      const supabase = getSupabaseClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();
      setIsLoggedIn(Boolean(session?.user));
    }

    loadSession();
  }, []);

  const onApply = () => {
    router.push(isLoggedIn ? '/become-a-pro/apply' : '/auth?mode=signup&next=/become-a-pro/apply');
  };

  return (
    <div className="section-shell max-w-4xl py-10">
      <header className="card-premium bg-[#111827] p-6 text-white sm:p-8">
        <p className="eyebrow text-red-200">Provider onboarding</p>
        <h1 className="page-title mt-2 text-white">Become an I-Kali Pro</h1>
        <p className="mt-3 text-gray-300">Apply to list your services on I-Kali. Verified pros can receive job requests after admin approval.</p>
      </header>
      <div className="card-premium mt-6 p-6">
        <h2 className="text-xl font-semibold text-[#080808]">What to expect</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
          <li>Share your service details, location coverage, and work experience.</li>
          <li>Your application is reviewed by I-Kali admin before listing is activated.</li>
          <li>Approved pros appear in service results and can start receiving bookings.</li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={onApply} className="focus-ring btn btn-primary" type="button">
            Apply as a Pro
          </button>
          <Link href="/trust" className="focus-ring btn btn-secondary">
            Learn about verification
          </Link>
        </div>
      </div>
    </div>
  );
}
