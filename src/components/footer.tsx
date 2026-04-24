import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 bg-[#0B0B0F] text-gray-300">
      <div className="section-shell grid gap-8 py-10 sm:grid-cols-2">
        <div>
          <p className="text-xl font-extrabold text-white">
            I <span className="text-[#D71920]">Kali</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-gray-400">
            Kenya&apos;s premium marketplace for trusted local services. Built for quality, speed, and confidence.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="font-semibold text-white">Platform</p>
            <Link href="/services" className="block hover:text-white">Services</Link>
            <Link href="/providers" className="block hover:text-white">Providers</Link>
            <Link href="/request" className="block hover:text-white">Request Service</Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-white">Company</p>
            <Link href="/trust" className="block hover:text-white">Trust & Safety</Link>
            <Link href="/become-a-pro" className="block hover:text-white">Become a Pro</Link>
            <Link href="/contact" className="block hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">© {new Date().getFullYear()} I Kali. All rights reserved.</div>
    </footer>
  );
}
