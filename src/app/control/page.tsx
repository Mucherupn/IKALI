const adminActions = [
  'Add provider',
  'Edit provider',
  'Delete provider',
  'Verify provider',
  'Add service category',
  'Edit service category',
  'View job requests',
  'Update job request status',
  'Feature selected providers'
];

export default function ControlPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Control Center</h1>
      <p className="mt-2 text-slate-600">Admin placeholder for internal marketplace operations.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {adminActions.map((action) => (
          <div key={action} className="card p-4 text-sm font-medium text-slate-700">
            {action}
          </div>
        ))}
      </div>
    </div>
  );
}
