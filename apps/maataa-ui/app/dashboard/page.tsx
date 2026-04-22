import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <div className="p-6 text-white">
          <h1 className="text-3xl font-bold">Maataa Dashboard</h1>
          <p className="mt-2 text-white/60">System overview, topology, runtime and control panels will appear here.</p>
        </div>
      </div>
    </div>
  );
}
