type TrustPillProps = {
  label: string;
  tone?: 'verified' | 'neutral' | 'pending';
};

const toneClasses: Record<NonNullable<TrustPillProps['tone']>, string> = {
  verified: 'bg-emerald-100 text-emerald-800',
  neutral: 'bg-slate-100 text-slate-700',
  pending: 'bg-amber-100 text-amber-800'
};

export function TrustPill({ label, tone = 'neutral' }: TrustPillProps) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}>{label}</span>;
}
