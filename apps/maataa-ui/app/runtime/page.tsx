import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { RuntimeFeed } from "@/components/runtime-feed";
import { TopologyMap } from "@/components/topology-map";

export default function RuntimePage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <div className="p-6 grid gap-6 md:grid-cols-2">
          <RuntimeFeed />
          <TopologyMap />
        </div>
      </div>
    </div>
  );
}
