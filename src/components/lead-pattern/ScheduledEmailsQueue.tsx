import { useState, useEffect } from "react";
import { Clock, Trash2, CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getScheduledEmails, cancelScheduledEmail, ScheduledEmail } from "@/lib/api/scheduledEmails";

const statusConfig: Record<string, { icon: typeof Clock; label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { icon: Clock, label: "Scheduled", variant: "secondary" },
  sending: { icon: Loader2, label: "Sending", variant: "default" },
  sent: { icon: CheckCircle2, label: "Sent", variant: "outline" },
  partially_sent: { icon: AlertCircle, label: "Partial", variant: "destructive" },
  failed: { icon: AlertCircle, label: "Failed", variant: "destructive" },
};

const ScheduledEmailsQueue = () => {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getScheduledEmails()
      .then(setEmails)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: string) => {
    try {
      await cancelScheduledEmail(id);
      setEmails((prev) => prev.filter((e) => e.id !== id));
      toast.success("Scheduled email cancelled");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="frappe-card p-8 text-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="frappe-card p-8 text-center">
        <Mail className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No scheduled emails yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {emails.map((email) => {
        const cfg = statusConfig[email.status] || statusConfig.pending;
        const Icon = cfg.icon;
        return (
          <div key={email.id} className="frappe-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={cfg.variant} className="text-[10px] gap-1">
                    <Icon className={`w-3 h-3 ${email.status === "sending" ? "animate-spin" : ""}`} />
                    {cfg.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(email.send_at), "PPP 'at' HH:mm")}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground truncate">{email.subject}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {email.recipients.length} recipient{email.recipients.length !== 1 ? "s" : ""}
                  {email.sent_count > 0 && ` · ${email.sent_count} sent`}
                </p>
                {email.error_message && (
                  <p className="text-xs text-destructive mt-1 truncate">{email.error_message}</p>
                )}
              </div>
              {email.status === "pending" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => handleCancel(email.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduledEmailsQueue;
