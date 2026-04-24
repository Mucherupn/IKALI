import { featuredProviders } from './data/mockProviders.js';
import { providerCard, sectionHeading, serviceCard, serviceItems, trustCard, trustPoints } from './components/ui.js';

const app = document.querySelector('#app');

app.innerHTML = `
  <main>
    <section class="hero-glow">
      <div class="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 md:pb-20 md:pt-16">
        <div class="surface rounded-3xl p-6 shadow-soft sm:p-8 md:p-10">
          <p class="text-sm font-medium uppercase tracking-widest text-brand-700">I Kali</p>
          <h1 class="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
            Book trusted local services in Kenya
          </h1>
          <p class="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            Find verified plumbers, electricians, cleaners, fundis, mechanics, barbers, and more near you.
          </p>
          <div class="mt-7 flex flex-col gap-3 sm:flex-row">
            <button class="rounded-xl bg-brand-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-700">
              Find a Service
            </button>
            <button class="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              Become a Pro
            </button>
          </div>

          <form class="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[1.4fr_1fr_auto] md:p-4" role="search">
            <label class="sr-only" for="service-search">Service</label>
            <input id="service-search" type="text" placeholder="What service do you need?" class="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none ring-brand-600 placeholder:text-slate-400 focus:ring-2" />
            <label class="sr-only" for="location">Location</label>
            <input id="location" type="text" placeholder="Location (optional)" class="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none ring-brand-600 placeholder:text-slate-400 focus:ring-2" />
            <button type="button" class="h-12 rounded-xl bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-700">Search</button>
          </form>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-16">
      ${sectionHeading('Popular Services', 'Explore top categories people in Kenya book most often.')}
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        ${serviceItems.map(serviceCard).join('')}
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-16">
      ${sectionHeading('How I Kali Works')}
      <div class="grid gap-4 md:grid-cols-3">
        ${[
          ['01', '🔍', 'Search for a service'],
          ['02', '🧑‍🔧', 'Choose a trusted professional'],
          ['03', '🏁', 'Get the job done']
        ]
          .map(
            ([step, icon, text]) => `
            <article class="surface rounded-2xl p-6 shadow-sm">
              <div class="text-xs font-semibold tracking-wider text-brand-700">STEP ${step}</div>
              <div class="mt-3 text-2xl" aria-hidden="true">${icon}</div>
              <h3 class="mt-3 text-lg font-semibold text-slate-900">${text}</h3>
            </article>
          `
          )
          .join('')}
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-16">
      ${sectionHeading('Featured Professionals', 'Trusted providers currently available near major towns and cities.')}
      <div class="grid gap-4 md:grid-cols-2">
        ${featuredProviders.slice(0, 4).map(providerCard).join('')}
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-16">
      ${sectionHeading('Why Trust I Kali')}
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        ${trustPoints.map(trustCard).join('')}
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-16">
      <div class="surface rounded-3xl p-7 md:p-10">
        <h2 class="text-2xl font-semibold text-slate-900 md:text-3xl">Are you a skilled professional? Join I Kali and get more clients.</h2>
        <p class="mt-3 max-w-3xl text-sm text-slate-600 md:text-base">
          Build trust with verified profiles, grow your customer base, and receive jobs from nearby clients.
        </p>
        <button class="mt-6 rounded-xl bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700">Become a Pro</button>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 md:pb-20 md:pt-14">
      <div class="rounded-3xl bg-slate-900 p-7 text-white shadow-soft md:p-10">
        <h2 class="text-2xl font-semibold md:text-3xl">Need a service today?</h2>
        <p class="mt-3 text-sm text-slate-200 md:text-base">Find trusted professionals near you in minutes.</p>
        <button class="mt-6 rounded-xl bg-white px-6 py-3 text-sm font-medium text-slate-900 hover:bg-slate-200">Find a Service</button>
      </div>
    </section>
  </main>

  <footer class="border-t border-slate-200 bg-white">
    <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div class="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <h3 class="text-lg font-semibold text-slate-900">I Kali</h3>
          <p class="mt-2 text-sm text-slate-500">Trusted local services across Kenya.</p>
        </div>
        <nav aria-label="Footer navigation" class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          <a href="#" class="hover:text-brand-700">Services</a>
          <a href="#" class="hover:text-brand-700">Providers</a>
          <a href="#" class="hover:text-brand-700">Become a Pro</a>
          <a href="#" class="hover:text-brand-700">About</a>
          <a href="#" class="hover:text-brand-700">Contact</a>
        </nav>
      </div>
      <p class="mt-8 text-xs text-slate-500">© ${new Date().getFullYear()} I Kali. All rights reserved.</p>
    </div>
  </footer>
`;
