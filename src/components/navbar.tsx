import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--red)] text-white shadow-[0_10px_35px_rgba(225,29,46,0.22)]">
      <div className="section-shell flex min-h-[72px] items-center justify-between gap-3 py-2 sm:min-h-[78px]">
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

        <nav className="hidden lg:flex">
          <Link href="/services" className="focus-ring rounded-md text-sm font-medium text-white/90 transition hover:text-white">
            Services
          </Link>
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link href="/auth" className="focus-ring rounded-md text-sm font-medium text-white/90 transition hover:text-white">
            Sign in / Sign up
          </Link>
          <Link
            href="/become-a-pro"
            className="focus-ring group inline-flex min-h-11 items-center rounded-full bg-black px-4 py-2.5 text-sm font-semibold shadow-[0_10px_25px_rgba(0,0,0,0.18)] transition hover:bg-white sm:px-6 sm:py-3"
          >
            <span className="text-white transition group-hover:!text-black">Become a Pro</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/become-a-pro"
            className="focus-ring inline-flex min-h-10 items-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
          >
            Become a Pro
          </Link>
          <Link href="/auth" className="focus-ring rounded-md px-2 py-1.5 text-sm font-medium text-white/90 transition hover:text-white" aria-label="Open sign in menu">
            Menu
          </Link>
        </div>
      </div>
    </header>
  );
}
