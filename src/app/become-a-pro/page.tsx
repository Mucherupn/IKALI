import Link from 'next/link';

export default function BecomeAProPage() {
  return (
    <div className="section-shell max-w-4xl py-10">
      <header className="card-premium bg-[#111827] p-6 text-white sm:p-8">
        <p className="eyebrow text-red-200">Provider recruitment</p>
        <h1 className="page-title mt-2 text-white">Become an I Kali Pro</h1>
        <p className="mt-3 text-gray-300">Join Nairobi&apos;s premium local services network and get matched with serious customers.</p>
      </header>
      <div className="card-premium mt-6 p-6">
        <h2 className="text-xl font-semibold text-[#080808]">What we need from you</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
          <li>National ID and phone verification</li>
          <li>Proven service expertise and work samples</li>
          <li>Service area within Nairobi and surrounding zones</li>
          <li>Professional conduct and customer-first mindset</li>
        </ul>
        <Link href="/contact" className="focus-ring mt-5 inline-flex btn btn-primary">Apply now</Link>
      </div>
    </div>
  );
}
