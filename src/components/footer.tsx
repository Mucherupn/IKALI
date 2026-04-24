import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:px-8">
        <p className="font-medium text-slate-900">I Kali — Internet Jua Kali</p>
        <p>Premium local services marketplace for Nairobi, Kenya.</p>
        <p>© {new Date().getFullYear()} I Kali. All rights reserved.</p>
        <Link href="/trust" className="w-fit font-medium text-teal-700 hover:text-teal-800">
          Trust & Safety
        </Link>
      </div>
    </footer>
  );
}
