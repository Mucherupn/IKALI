export const serviceItems = [
  { icon: '🔧', title: 'Plumbing', label: 'Repairs, leaks, installations' },
  { icon: '⚡', title: 'Electrical', label: 'Wiring, fittings, maintenance' },
  { icon: '🧼', title: 'Cleaning', label: 'Home and office deep cleaning' },
  { icon: '🎨', title: 'Painting', label: 'Interior and exterior finishes' },
  { icon: '🛠️', title: 'Appliance Repair', label: 'Fridges, cookers, washing machines' },
  { icon: '📦', title: 'Moving', label: 'Packing, transport, setup' },
  { icon: '🚗', title: 'Mechanics', label: 'Vehicle diagnostics and repairs' },
  { icon: '💈', title: 'Barber Services', label: 'Home and studio grooming' }
];

export const trustPoints = [
  {
    icon: '✅',
    title: 'Verified professionals',
    description: 'Every provider goes through profile and identity checks before appearing on I Kali.'
  },
  {
    icon: '💬',
    title: 'Transparent pricing',
    description: 'Clear quotes and service details help you decide quickly with confidence.'
  },
  {
    icon: '⚡',
    title: 'Fast response',
    description: 'Get matched with available pros near you and receive replies in minutes.'
  },
  {
    icon: '📍',
    title: 'Local expertise',
    description: 'Find experienced professionals who understand your neighborhood and needs.'
  }
];

export function sectionHeading(title, subtitle = '') {
  return `
    <div class="mb-8 text-left md:text-center">
      <h2 class="text-2xl font-semibold text-slate-900 md:text-3xl">${title}</h2>
      ${subtitle ? `<p class="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">${subtitle}</p>` : ''}
    </div>
  `;
}

export function serviceCard(item) {
  return `
    <article class="surface rounded-2xl p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div class="text-2xl" aria-hidden="true">${item.icon}</div>
      <h3 class="mt-4 text-base font-semibold text-slate-900">${item.title}</h3>
      <p class="mt-2 text-sm text-slate-600">${item.label}</p>
    </article>
  `;
}

export function providerCard(provider) {
  return `
    <article class="surface rounded-2xl p-4 shadow-sm md:p-5">
      <div class="flex items-start gap-4">
        <img src="${provider.photo}" alt="${provider.name}" class="h-16 w-16 rounded-xl object-cover" loading="lazy" />
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-base font-semibold text-slate-900">${provider.name}</h3>
            ${provider.verified ? '<span class="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">Verified</span>' : ''}
          </div>
          <p class="text-sm text-slate-700">${provider.service}</p>
          <p class="mt-1 text-xs text-slate-500">${provider.location}</p>
        </div>
      </div>
      <div class="mt-4 flex items-center gap-2 text-sm text-slate-600">
        <span class="text-amber-500">★</span>
        <span>${provider.rating}</span>
        <span>(${provider.reviews} reviews)</span>
      </div>
      <p class="mt-3 text-sm leading-relaxed text-slate-600">${provider.description}</p>
      <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button class="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Call</button>
        <button class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100">WhatsApp</button>
        <button class="rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700">View profile</button>
      </div>
    </article>
  `;
}

export function trustCard(point) {
  return `
    <article class="surface rounded-2xl p-5 shadow-sm">
      <div class="text-2xl" aria-hidden="true">${point.icon}</div>
      <h3 class="mt-4 text-base font-semibold text-slate-900">${point.title}</h3>
      <p class="mt-2 text-sm leading-relaxed text-slate-600">${point.description}</p>
    </article>
  `;
}
