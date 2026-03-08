import { useState } from "react";
import { Download, Copy, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { BusinessLead } from "@/lib/api/leadpattern";
import ExportToCrmButton from "./ExportToCrmButton";

interface BusinessResultsTableProps {
  leads: BusinessLead[];
  isLoading: boolean;
  onSelectLead: (lead: BusinessLead) => void;
}

// Flatten: one row per email
interface FlatRow {
  leadId: string;
  email: string;
  name: string;
  industry: string;
  location: string;
  website: string;
  lead: BusinessLead;
}

const BusinessResultsTable = ({ leads, isLoading, onSelectLead }: BusinessResultsTableProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const pageSize = 50;

  // Flatten emails
  const flatRows: FlatRow[] = leads.flatMap((lead) =>
    (lead.emails || []).length > 0
      ? lead.emails.map((email, i) => ({
          leadId: `${lead.id}-${i}`,
          email,
          name: lead.name,
          industry: lead.industry || "",
          location: lead.location || "",
          website: lead.website || "",
          lead,
        }))
      : [{
          leadId: lead.id,
          email: "—",
          name: lead.name,
          industry: lead.industry || "",
          location: lead.location || "",
          website: lead.website || "",
          lead,
        }]
  );

  const totalPages = Math.ceil(flatRows.length / pageSize);
  const pagedRows = flatRows.slice(page * pageSize, (page + 1) * pageSize);

  const toggleAll = () => {
    if (selected.size === flatRows.length) setSelected(new Set());
    else setSelected(new Set(flatRows.map((r) => r.leadId)));
  };

  const copyEmails = () => {
    const emails = flatRows
      .filter((r) => selected.has(r.leadId) && r.email !== "—")
      .map((r) => r.email)
      .join("\n");
    navigator.clipboard.writeText(emails);
    toast.success(`${selected.size} emails copied`);
  };

  const exportCSV = () => {
    const rows = flatRows.filter((r) => selected.size === 0 || selected.has(r.leadId));
    const csv = [
      "Business Name,Industry,Location,Website,Email",
      ...rows.map((r) => `"${r.name}","${r.industry}","${r.location}","${r.website}","${r.email}"`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "business-leads.csv";
    a.click();
    toast.success("CSV exported");
  };

  if (isLoading) {
    return (
      <div className="frappe-card p-12 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Processing search job...</p>
      </div>
    );
  }

  if (flatRows.length === 0) {
    return (
      <div className="frappe-card p-12 text-center">
        <Mail className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No business leads yet. Start a search above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">{flatRows.length}</span> emails from{" "}
          <span className="text-foreground font-semibold">{leads.length}</span> businesses
          {selected.size > 0 && <span className="text-primary"> · {selected.size} selected</span>}
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

      <div className="frappe-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox checked={selected.size === flatRows.length && flatRows.length > 0} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead className="frappe-label">Business</TableHead>
              <TableHead className="frappe-label">Email</TableHead>
              <TableHead className="frappe-label">Industry</TableHead>
              <TableHead className="frappe-label">Location</TableHead>
              <TableHead className="frappe-label">Website</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.map((r) => (
              <TableRow
                key={r.leadId}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onSelectLead(r.lead)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(r.leadId)}
                    onCheckedChange={() => {
                      const next = new Set(selected);
                      next.has(r.leadId) ? next.delete(r.leadId) : next.add(r.leadId);
                      setSelected(next);
                    }}
                  />
                </TableCell>
                <TableCell>
                  <span className="font-medium text-sm text-foreground">{r.name}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-primary font-medium">{r.email}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-foreground">{r.industry}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-foreground">{r.location}</span>
                </TableCell>
                <TableCell>
                  {r.website && r.website !== "—" ? (
                    <a
                      href={r.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {r.website.replace(/^https?:\/\//, "")}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default BusinessResultsTable;
