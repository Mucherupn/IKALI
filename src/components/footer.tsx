import Link from 'next/link';

const footerLinks = [
  { href: '/services', label: 'Services' },
  { href: '/providers', label: 'Providers' },
  { href: '/trust', label: 'Trust' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/request', label: 'Request service' },
  { href: '/become-a-pro', label: 'Become a Pro' }
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-[#090909] text-white sm:mt-24">
      <div className="section-shell py-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
          <div>
            <Link href="/" className="inline-flex items-center rounded-xl bg-white px-4 py-2.5">
              <span className="text-xl font-black tracking-[-0.06em] text-[var(--red)]">I</span>
              <span className="mx-0.5 text-xl font-black tracking-[-0.06em] text-black">-</span>
              <span className="text-xl font-black tracking-[-0.06em] text-[var(--red)]">Kali</span>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/55">Trusted local services, built for Kenya.</p>

            <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
              <Link
                href="/app"
                className="group inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:bg-white"
              >
                <span className="transition group-hover:!text-black">App Store</span>
              </Link>

              <Link
                href="/app"
                className="group inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:bg-white"
              >
                <span className="transition group-hover:!text-black">Google Play</span>
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Explore</p>
            <div className="mt-4 grid gap-x-8 gap-y-3 text-sm text-white/55 sm:grid-cols-2">
              {footerLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block transition hover:text-white">
                  {link.label}
                </Link>
              ))}
              <span className="text-white/50">App Store</span>
              <span className="text-white/50">Google Play</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} I-Kali. All rights reserved.</p>
          <p>Find service providers near you.</p>
        </div>
      </div>
    </footer>
  );
}
