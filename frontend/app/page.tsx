import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ComplianceTrendChart } from "@/components/dashboard/compliance-trend-chart";
import { DonutCard } from "@/components/dashboard/donut-card";
import { RecentDocumentsPanel, UpcomingTasksPanel, RecentActivityPanel } from "@/components/dashboard/panels";
import { AIInsightsStrip } from "@/components/dashboard/ai-insights-strip";
import { AIAssistantCard } from "@/components/shared/ai-assistant-card";
import { kpis, obligationsByDept, riskDistribution, currentUser } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Welcome back, {currentUser.name.split(" ")[0]}! 👋</h1>
          <p className="mt-1 text-sm text-foreground-muted">Here&apos;s your compliance overview for today.</p>
        </div>
        <Button size="lg"><Upload className="h-4 w-4" /> Upload Circular</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.slice(0, 5).map((kpi, i) => (
          <KpiCard key={kpi.id} kpi={kpi} index={i} />
        ))}
      </div>

      <AIInsightsStrip />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ComplianceTrendChart />
        <DonutCard title="Obligations by Department" data={obligationsByDept} total={128} />
        <DonutCard title="Risk Distribution" data={riskDistribution} total={128} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RecentDocumentsPanel />
        <UpcomingTasksPanel />
        <RecentActivityPanel />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <AIAssistantCard className="xl:col-span-1" />
      </div>
    </div>
  );
}
