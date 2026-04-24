import { nairobiAreas, serviceCategories } from '@/data/mock-data';

export default function RequestPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Request a job</h1>
      <p className="mt-2 text-slate-600">Tell us what you need and we will connect you with the right local professional.</p>

      <form className="card mt-8 space-y-5 p-6">
        <div>
          <label htmlFor="service" className="mb-2 block text-sm font-medium text-slate-700">
            Service needed
          </label>
          <select id="service" className="focus-ring w-full rounded-lg border border-slate-300 px-3 py-2">
            {serviceCategories.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="location" className="mb-2 block text-sm font-medium text-slate-700">
              Location
            </label>
            <select id="location" className="focus-ring w-full rounded-lg border border-slate-300 px-3 py-2">
              {nairobiAreas.map((area) => (
                <option key={area}>{area}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="mb-2 block text-sm font-medium text-slate-700">
              Preferred date
            </label>
            <input id="date" type="date" className="focus-ring w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">
            Description of issue
          </label>
          <textarea
            id="description"
            rows={4}
            className="focus-ring w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Describe what you need done"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
              Your name
            </label>
            <input id="name" type="text" className="focus-ring w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
              Phone number
            </label>
            <input id="phone" type="tel" className="focus-ring w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
        </div>

        <button type="submit" className="focus-ring rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800">
          Submit request
        </button>
      </form>
    </div>
  );
}
