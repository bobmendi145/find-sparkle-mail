import { useState } from "react";
import { Download, Copy, Linkedin, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { PeopleLead } from "@/lib/api/leadpattern";
import ExportToCrmButton from "./ExportToCrmButton";
import SendEmailDialog from "./SendEmailDialog";

interface PeopleResultsTableProps {
  leads: PeopleLead[];
  isLoading: boolean;
  onSelectLead: (lead: PeopleLead) => void;
}

const PeopleResultsTable = ({ leads, isLoading, onSelectLead }: PeopleResultsTableProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const totalPages = Math.ceil(leads.length / pageSize);
  const pagedLeads = leads.slice(page * pageSize, (page + 1) * pageSize);

  const toggleAll = () => {
    if (selected.size === leads.length) setSelected(new Set());
    else setSelected(new Set(leads.map((l) => l.id)));
  };

  const copyEmails = () => {
    const emails = leads
      .filter((l) => selected.has(l.id) && l.primary_email)
      .map((l) => l.primary_email!)
      .join("\n");
    navigator.clipboard.writeText(emails);
    toast.success(`${selected.size} emails copied`);
  };

  const exportCSV = () => {
    const rows = leads.filter((l) => selected.size === 0 || selected.has(l.id));
    const csv = [
      "Full Name,First Name,Last Name,Role,Company,Domain,Primary Email,Generated Emails,Source URL",
      ...rows.map(
        (l) =>
          `"${l.full_name}","${l.first_name || ""}","${l.last_name || ""}","${l.role || ""}","${l.company || ""}","${l.domain || ""}","${l.primary_email || ""}","${(l.generated_emails || []).join(";")}","${l.source_url || ""}"`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "people-leads.csv";
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

  if (leads.length === 0) {
    return (
      <div className="frappe-card p-12 text-center">
        <Users className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No people leads yet. Start a search above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">{leads.length}</span> people found
          {selected.size > 0 && <span className="text-primary"> · {selected.size} selected</span>}
        </p>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <Button variant="outline" size="sm" onClick={copyEmails}>
              <Copy className="w-3.5 h-3.5" /> Copy
            </Button>
          )}
          <ExportToCrmButton
            getLeads={() => {
              const rows = leads.filter((l) => selected.size === 0 || selected.has(l.id));
              return rows.map((l) => ({
                email: l.primary_email || undefined,
                first_name: l.first_name || undefined,
                last_name: l.last_name || undefined,
                full_name: l.full_name,
                company: l.company || undefined,
                role: l.role || undefined,
              }));
            }}
            disabled={leads.length === 0}
          />
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
                <Checkbox checked={selected.size === leads.length && leads.length > 0} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead className="frappe-label">Person</TableHead>
              <TableHead className="frappe-label">Primary Email</TableHead>
              <TableHead className="frappe-label">Role</TableHead>
              <TableHead className="frappe-label">Company</TableHead>
              <TableHead className="frappe-label">Domain</TableHead>
              <TableHead className="frappe-label">Alternatives</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedLeads.map((l) => (
              <TableRow
                key={l.id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onSelectLead(l)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(l.id)}
                    onCheckedChange={() => {
                      const next = new Set(selected);
                      next.has(l.id) ? next.delete(l.id) : next.add(l.id);
                      setSelected(next);
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div>
                      <span className="font-medium text-sm text-foreground">{l.full_name}</span>
                      {l.country && <p className="text-xs text-muted-foreground">{l.country}</p>}
                    </div>
                    {l.source_url && (
                      <a
                        href={l.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-primary font-medium">{l.primary_email || "—"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-foreground">{l.role || "—"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-foreground">{l.company || "—"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">{l.domain || "—"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {(l.generated_emails || []).length} variants
                  </span>
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

export default PeopleResultsTable;
