import { useState } from "react";
import { Download, Copy, CheckCircle2, AlertTriangle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmailResult } from "@/types/emailFinder";
import { toast } from "sonner";

interface ResultsTableProps {
  results: EmailResult[];
  isLoading: boolean;
}

const StatusIcon = ({ status }: { status: EmailResult["status"] }) => {
  switch (status) {
    case "valid":
      return <CheckCircle2 className="w-4 h-4 text-success" />;
    case "risky":
      return <AlertTriangle className="w-4 h-4 text-warning" />;
    default:
      return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
  }
};

const ConfidenceBadge = ({ score }: { score: number }) => {
  const color = score >= 90 ? "bg-success/10 text-success border-success/20"
    : score >= 75 ? "bg-primary/10 text-primary border-primary/20"
    : "bg-warning/10 text-warning border-warning/20";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${color}`}>
      {score}%
    </span>
  );
};

const ResultsTable = ({ results, isLoading }: ResultsTableProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<"confidence" | "email">("confidence");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleAll = () => {
    if (selected.size === results.length) setSelected(new Set());
    else setSelected(new Set(results.map((r) => r.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const sorted = [...results].sort((a, b) => {
    const m = sortDir === "asc" ? 1 : -1;
    if (sortField === "confidence") return (a.confidence - b.confidence) * m;
    return a.email.localeCompare(b.email) * m;
  });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const copyEmails = () => {
    const emails = results.filter((r) => selected.has(r.id)).map((r) => r.email).join("\n");
    navigator.clipboard.writeText(emails);
    toast.success(`${selected.size} emails copied`);
  };

  const exportCSV = () => {
    const rows = results.filter((r) => selected.size === 0 || selected.has(r.id));
    const csv = [
      "First Name,Last Name,Email,Title,Company,Domain,Confidence,Status",
      ...rows.map((r) => `${r.firstName},${r.lastName},${r.email},${r.title},${r.company},${r.domain},${r.confidence},${r.status}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "email-results.csv"; a.click();
    toast.success("CSV exported");
  };

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Searching across enriched database...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <p className="text-muted-foreground text-sm">Enter a name and domain or apply filters to find emails.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">{results.length}</span> results found
          {selected.size > 0 && <span className="text-primary"> • {selected.size} selected</span>}
        </p>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <Button variant="outline" size="sm" onClick={copyEmails}>
              <Copy className="w-3.5 h-3.5" /> Copy
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={selected.size === results.length && results.length > 0}
                  onCheckedChange={toggleAll}
                  className="border-border"
                />
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Person</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort("email")}>
                <span className="flex items-center gap-1">Email <SortIcon field="email" /></span>
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Title</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Company</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort("confidence")}>
                <span className="flex items-center gap-1">Score <SortIcon field="confidence" /></span>
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((r) => (
              <TableRow key={r.id} className="border-border hover:bg-surface-2/50 transition-colors">
                <TableCell>
                  <Checkbox
                    checked={selected.has(r.id)}
                    onCheckedChange={() => toggleOne(r.id)}
                    className="border-border"
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <span className="font-medium text-sm text-foreground">{r.firstName} {r.lastName}</span>
                    <p className="text-xs text-muted-foreground">{r.location}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-primary">{r.email}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-secondary-foreground">{r.title}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <span className="text-xs font-medium text-foreground">{r.company}</span>
                    <p className="text-[10px] text-muted-foreground">{r.domain}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <ConfidenceBadge score={r.confidence} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <StatusIcon status={r.status} />
                    <span className="text-xs capitalize text-muted-foreground">{r.status}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ResultsTable;
