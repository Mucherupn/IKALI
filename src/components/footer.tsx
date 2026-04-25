import Link from 'next/link';

const footerLinks = [
  {
    title: 'Explore',
    links: [
      { href: '/services', label: 'Services' },
      { href: '/providers', label: 'Providers' },
      { href: '/request', label: 'Request service' },
      { href: '/trust', label: 'Trust' }
    ]
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/become-a-pro', label: 'Join as Pro' },
      { href: '/contact', label: 'Contact' }
    ]
  }
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-[#090909] text-white">
      <div className="section-shell py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
          <div>
            <Link href="/" className="inline-flex items-center rounded-xl bg-white px-4 py-2.5">
              <span className="text-xl font-black tracking-[-0.06em] text-[var(--red)]">I</span>
              <span className="mx-0.5 text-xl font-black tracking-[-0.06em] text-black">-</span>
              <span className="text-xl font-black tracking-[-0.06em] text-[var(--red)]">Kali</span>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/55">
              Trusted local services, built for Kenya.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
  href="/app"
  className="group rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:bg-white"
>
  <span className="transition group-hover:!text-black">
    App Store
  </span>
</Link>

<Link
  href="/app"
  className="group rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:bg-white"
>
  <span className="transition group-hover:!text-black">
    Google Play
  </span>
</Link>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-semibold text-white">{group.title}</p>
                <div className="mt-4 space-y-3 text-sm text-white/55">
                  {group.links.map((link) => (
                    <Link key={link.href} href={link.href} className="block transition hover:text-white">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <p className="text-sm font-semibold text-white">Get started</p>
              <div className="mt-4 space-y-3 text-sm text-white/55">
                <Link href="/request" className="block transition hover:text-white">
                  Find help
                </Link>
                <Link href="/providers" className="block transition hover:text-white">
                  Browse providers
                </Link>
                <Link href="/services" className="block transition hover:text-white">
                  Browse services
                </Link>
              </div>
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