type TrustPillProps = {
  label: string;
  tone?: 'verified' | 'neutral' | 'pending';
};

const toneClasses: Record<NonNullable<TrustPillProps['tone']>, string> = {
  verified: 'bg-[#fff1f2] text-[#9f1239] border border-[#fecdd3]',
  neutral: 'bg-[#f3f4f6] text-[#111827] border border-[#e5e7eb]',
  pending: 'bg-amber-50 text-amber-800 border border-amber-200'
};

export function TrustPill({ label, tone = 'neutral' }: TrustPillProps) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}>{label}</span>;
}
