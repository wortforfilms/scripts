import { Bell, Search } from "lucide-react";

export function Topbar() {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-yellow-500/15 bg-black/40 px-6 py-4 backdrop-blur-xl">
      <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <Search className="h-4 w-4 text-yellow-300" />
        <input className="w-full bg-transparent text-sm text-white outline-none" placeholder="Search..." />
      </div>
      <button className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/70"><Bell className="h-5 w-5" /></button>
    </div>
  );
}
