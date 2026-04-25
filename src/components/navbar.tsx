import Link from 'next/link';

const links = [
  { href: '/services', label: 'Services' },
  { href: '/providers', label: 'Providers' },
  { href: '/trust', label: 'Trust' },
  { href: '/become-a-pro', label: 'Join as Pro' },
  { href: '/pro', label: 'Pro Hub' },
  { href: '/login', label: 'Log in' },
  { href: '/account', label: 'Account' }
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--red)] text-white shadow-[0_10px_35px_rgba(225,29,46,0.22)]">
      <div className="section-shell flex min-h-[72px] items-center justify-between gap-3 py-2 sm:min-h-[78px]">
        {/* Logo */}
        <Link
          href="/"
          aria-label="I-Kali home"
          className="focus-ring inline-flex items-center rounded-xl"
        >
          <span className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.10)]">
            <span className="text-[1.35rem] font-black leading-none tracking-[-0.06em] text-[var(--red)]">
              I
            </span>
            <span className="mx-0.5 text-[1.35rem] font-black leading-none tracking-[-0.06em] text-black">
              -
            </span>
            <span className="text-[1.35rem] font-black leading-none tracking-[-0.06em] text-[var(--red)]">
              Kali
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring rounded-md text-sm font-medium text-white/90 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link
          href="/request"
          className="focus-ring group inline-flex min-h-11 items-center rounded-full bg-black px-4 py-2.5 text-sm font-semibold shadow-[0_10px_25px_rgba(0,0,0,0.18)] transition hover:bg-white sm:px-6 sm:py-3"
        >
          <span className="text-white transition group-hover:!text-black">
            Request service
          </span>
        </Link>
      </div>

      {/* Mobile Nav */}
      <nav className="section-shell flex gap-4 overflow-x-auto pb-3 text-sm lg:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="focus-ring shrink-0 rounded-md py-1.5 font-medium text-white/90 transition hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
