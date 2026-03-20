export default function TopBar({ title, actions }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-surface-high bg-white">
      <h1 className="text-[18px] font-semibold tracking-tight text-on-surface">{title}</h1>
      <div className="flex items-center gap-3">
        {actions}
        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-[12px] font-semibold ml-2">
          P
        </div>
      </div>
    </div>
  )
}
