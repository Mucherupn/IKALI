export default function AppComingSoonPage() {
  return (
    <main className="bg-[#fbfaf8] py-20 sm:py-28">
      <section className="section-shell">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-[#eeeeee] bg-white p-7 text-center shadow-[0_24px_70px_rgba(17,17,17,0.08)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--red)]">
            I-Kali app
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#111111] sm:text-5xl">
            The mobile app is coming soon.
          </h1>

          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#666666]">
            Leave your email and we will let you know when the I-Kali app is ready.
          </p>

          <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="min-h-12 flex-1 rounded-full border border-[#e5e5e5] bg-white px-5 text-sm outline-none focus:border-[#efb6bd] focus:ring-4 focus:ring-[#e11d2e]/10"
            />

            <button
              type="submit"
              className="min-h-12 rounded-full bg-[var(--red)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--red-dark)]"
            >
              Notify me
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}