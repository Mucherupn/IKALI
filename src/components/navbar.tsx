import Link from 'next/link';

const links = [
  { href: '/services', label: 'Services' },
  { href: '/providers', label: 'Providers' },
  { href: '/request', label: 'Request Job' },
  { href: '/become-a-pro', label: 'Become a Pro' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/trust', label: 'Trust & Safety' }
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="focus-ring rounded-md text-lg font-semibold text-slate-900">
          I <span className="text-teal-700">Kali</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="focus-ring rounded-md transition hover:text-slate-900">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/request" className="focus-ring btn btn-primary">
          Get Help
        </Link>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3 md:hidden sm:px-6 lg:px-8">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="focus-ring whitespace-nowrap rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
