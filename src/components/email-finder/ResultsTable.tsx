import { useState } from "react";
import { Download, Copy, CheckCircle2, AlertTriangle, HelpCircle, ChevronDown, ChevronUp, Linkedin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmailResult } from "@/types/emailFinder";
import { toast } from "sonner";

interface ResultsTableProps {
  results: EmailResult[];
  isLoading: boolean;
  onRefresh?: () => void;
}

const StatusIcon = ({ status }: { status: EmailResult["status"] }) => {
  switch (status) {
    case "valid": return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
    case "risky": return <AlertTriangle className="w-3.5 h-3.5 text-warning" />;
    default: return <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />;
  }
};

const ConfidenceBadge = ({ score }: { score: number }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
      {score}%
    </span>
  );
};

const ResultsTable = ({ results, isLoading, onRefresh }: ResultsTableProps) => {
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
      <div className="frappe-card p-12 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Searching across enriched database...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="frappe-card p-12 text-center">
        <p className="text-sm text-muted-foreground">Enter a name and domain or apply filters to find emails.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">{results.length}</span> results
          {selected.size > 0 && <span className="text-primary"> · {selected.size} selected</span>}
        </p>
        <div className="flex gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          )}
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

      <div className="frappe-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox checked={selected.size === results.length && results.length > 0} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead className="frappe-label">Person</TableHead>
              <TableHead className="frappe-label cursor-pointer select-none" onClick={() => toggleSort("email")}>
                <span className="flex items-center gap-1">Email <SortIcon field="email" /></span>
              </TableHead>
              <TableHead className="frappe-label">Title</TableHead>
              <TableHead className="frappe-label">Company</TableHead>
              <TableHead className="frappe-label cursor-pointer select-none" onClick={() => toggleSort("confidence")}>
                <span className="flex items-center gap-1">Score <SortIcon field="confidence" /></span>
              </TableHead>
              <TableHead className="frappe-label">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((r) => (
              <TableRow key={r.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleOne(r.id)} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div>
                      <span className="font-medium text-sm text-foreground">{r.firstName} {r.lastName}</span>
                      <p className="text-xs text-muted-foreground">{r.location}</p>
                    </div>
                    {r.linkedinUrl && (
                      <a href={r.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title="LinkedIn Profile">
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-primary font-medium">{r.email}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-foreground">{r.title}</span>
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
