import { Activity } from "lucide-react";
import { useUsageQuota } from "@/hooks/useUsageQuota";

const UsageBadge = () => {
  const { quota, loading } = useUsageQuota();

  if (loading || !quota) return null;
  if (quota.is_admin) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
        <Activity className="w-3 h-3" />
        Admin · Unlimited
      </div>
    );
  }

  const dailyPct = (quota.daily_used / quota.daily_limit) * 100;
  const dangerDay = dailyPct >= 90;
  const warnDay = dailyPct >= 70;

  return (
    <div className="hidden sm:flex items-center gap-3 text-xs px-2.5 py-1 rounded-full bg-muted border border-border">
      <span className={`flex items-center gap-1 ${dangerDay ? "text-destructive" : warnDay ? "text-warning" : "text-muted-foreground"}`}>
        <Activity className="w-3 h-3" />
        Today: <span className="font-medium text-foreground">{quota.daily_used}</span>/{quota.daily_limit}
      </span>
      <span className="w-px h-3 bg-border" />
      <span className="text-muted-foreground">
        Month: <span className="font-medium text-foreground">{quota.monthly_used}</span>/{quota.monthly_limit}
      </span>
    </div>
  );
};

export default UsageBadge;
