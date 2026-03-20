export default function SourceChip({ label, variant = 'amber' }) {
  const variants = {
    amber: 'bg-amber-100 text-amber-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${variants[variant]}`}>
      {label}
    </span>
  )
}
