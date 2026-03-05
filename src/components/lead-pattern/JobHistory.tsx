import { Clock, CheckCircle2, AlertTriangle, Loader2, XCircle } from "lucide-react";
import { SearchJob } from "@/lib/api/leadpattern";

interface JobHistoryProps {
  jobs: SearchJob[];
  onSelectJob: (jobId: string) => void;
  activeJobId?: string;
}

const statusConfig = {
  pending: { icon: Clock, color: "text-muted-foreground", label: "Pending" },
  running: { icon: Loader2, color: "text-primary", label: "Running" },
  completed: { icon: CheckCircle2, color: "text-success", label: "Completed" },
  failed: { icon: XCircle, color: "text-destructive", label: "Failed" },
};

const JobHistory = ({ jobs, onSelectJob, activeJobId }: JobHistoryProps) => {
  if (jobs.length === 0) return null;

  return (
    <div className="frappe-card overflow-hidden">
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Job History</h3>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {jobs.map((job) => {
          const cfg = statusConfig[job.status];
          const Icon = cfg.icon;
          const isActive = job.id === activeJobId;
          const input = job.input_json as Record<string, any>;
          const label = job.type === "business"
            ? `${input.industry || "?"} in ${input.location || "?"}`
            : `${input.role || "?"} ${input.company ? `at ${input.company}` : input.country ? `in ${input.country}` : ""}`;

          return (
            <button
              key={job.id}
              onClick={() => onSelectJob(job.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-0 ${isActive ? "bg-muted" : ""}`}
            >
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${cfg.color} ${job.status === "running" ? "animate-spin" : ""}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {cfg.label} · {job.results_count || 0} results · {new Date(job.created_at).toLocaleString()}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default JobHistory;
