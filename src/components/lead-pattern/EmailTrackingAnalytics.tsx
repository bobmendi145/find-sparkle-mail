import { useState, useEffect } from "react";
import { BarChart3, Eye, MousePointer, Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  EmailTrackingRecord,
  TrackingStats,
  getTrackingRecords,
  computeStats,
} from "@/lib/api/emailTracking";

const EmailTrackingAnalytics = () => {
  const [records, setRecords] = useState<EmailTrackingRecord[]>([]);
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getTrackingRecords();
      setRecords(data);
      setStats(computeStats(data));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="frappe-card p-8 text-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="frappe-card p-8 text-center">
        <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No tracked emails yet. Send an email to start seeing analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="frappe-card p-4 text-center">
            <Send className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{stats.totalSent}</p>
            <p className="text-[10px] text-muted-foreground">Emails Sent</p>
          </div>
          <div className="frappe-card p-4 text-center">
            <Eye className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{stats.openRate.toFixed(1)}%</p>
            <p className="text-[10px] text-muted-foreground">Open Rate ({stats.uniqueOpened}/{stats.totalSent})</p>
          </div>
          <div className="frappe-card p-4 text-center">
            <MousePointer className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{stats.clickRate.toFixed(1)}%</p>
            <p className="text-[10px] text-muted-foreground">Click Rate ({stats.uniqueClicked}/{stats.totalSent})</p>
          </div>
          <div className="frappe-card p-4 text-center">
            <BarChart3 className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{stats.totalOpens}</p>
            <p className="text-[10px] text-muted-foreground">Total Opens</p>
          </div>
        </div>
      )}

      {/* Refresh */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Tracking table */}
      <div className="frappe-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Recipient</TableHead>
                <TableHead className="text-xs">Subject</TableHead>
                <TableHead className="text-xs text-center">Opens</TableHead>
                <TableHead className="text-xs text-center">Clicks</TableHead>
                <TableHead className="text-xs">First Opened</TableHead>
                <TableHead className="text-xs">Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.slice(0, 50).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs font-mono">{r.recipient}</TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">{r.subject || "—"}</TableCell>
                  <TableCell className="text-center">
                    {r.opens > 0 ? (
                      <Badge variant="default" className="text-[10px]">
                        {r.opens}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">0</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.clicks > 0 ? (
                      <Badge variant="default" className="text-[10px]">
                        {r.clicks}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">0</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.first_opened_at ? format(new Date(r.first_opened_at), "MMM d, HH:mm") : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(r.sent_at), "MMM d, HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {records.length > 50 && (
          <div className="p-3 text-center border-t border-border">
            <p className="text-xs text-muted-foreground">Showing 50 of {records.length} tracked emails</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTrackingAnalytics;
