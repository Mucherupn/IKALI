import Link from 'next/link';

const links = [
  { href: '/services', label: 'Services' },
  { href: '/providers', label: 'Providers' },
  { href: '/trust', label: 'Trust' },
  { href: '/become-a-pro', label: 'Become a Pro' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur">
      <div className="section-shell flex items-center justify-between gap-3 py-3">
        <Link href="/" className="focus-ring rounded-md text-xl font-black tracking-tight text-[#080808]">
          I <span className="text-[#D71920]">Kali</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-gray-600 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="focus-ring rounded-md transition hover:text-[#D71920]">
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/request" className="focus-ring btn btn-primary">
          Request Service
        </Link>
      </div>

      <nav className="section-shell flex gap-2 overflow-x-auto pb-3 md:hidden">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="focus-ring whitespace-nowrap rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
