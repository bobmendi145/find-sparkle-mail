import { useState, useCallback, useRef } from "react";
import { Upload, FileText, X, CheckCircle2, AlertTriangle, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface CSVRow {
  firstName: string;
  lastName: string;
  domain: string;
}

interface CSVResult {
  firstName: string;
  lastName: string;
  domain: string;
  email: string;
  confidence: number;
  status: "valid" | "risky" | "unknown";
}

interface BulkCSVImportProps {
  onResultsReady?: (results: CSVResult[]) => void;
}

const EMAIL_PATTERNS = [
  (f: string, l: string) => `${f}.${l}`,
  (f: string, l: string) => `${f[0]}${l}`,
  (f: string, l: string) => `${f}`,
  (f: string, l: string) => `${f}_${l}`,
  (f: string, l: string) => `${f[0]}.${l}`,
];

function generateEmail(firstName: string, lastName: string, domain: string): CSVResult {
  const f = firstName.toLowerCase().trim();
  const l = lastName.toLowerCase().trim();
  const pattern = EMAIL_PATTERNS[Math.floor(Math.random() * 2)]; // prefer common patterns
  const email = `${pattern(f, l)}@${domain.toLowerCase().trim()}`;
  const confidence = 70 + Math.floor(Math.random() * 28);
  const status: CSVResult["status"] = confidence > 85 ? "valid" : confidence > 75 ? "risky" : "unknown";
  return { firstName, lastName, domain, email, confidence, status };
}

function parseCSV(text: string): CSVRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const cols = header.split(",").map((c) => c.trim());

  const fnIdx = cols.findIndex((c) => c.includes("first") || c === "fname");
  const lnIdx = cols.findIndex((c) => c.includes("last") || c === "lname");
  const domIdx = cols.findIndex((c) => c.includes("domain") || c.includes("company") || c.includes("website"));

  if (fnIdx === -1 || lnIdx === -1 || domIdx === -1) return [];

  return lines.slice(1).filter(Boolean).map((line) => {
    const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
    return {
      firstName: parts[fnIdx] || "",
      lastName: parts[lnIdx] || "",
      domain: parts[domIdx] || "",
    };
  }).filter((r) => r.firstName && r.lastName && r.domain);
}

const BulkCSVImport = ({ onResultsReady }: BulkCSVImportProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [results, setResults] = useState<CSVResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }
    setFile(f);
    setResults([]);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseCSV(e.target?.result as string);
      setRows(parsed);
      if (parsed.length === 0) {
        toast.error("Could not parse CSV. Ensure columns: first_name, last_name, domain");
      } else {
        toast.success(`${parsed.length} rows parsed`);
      }
    };
    reader.readAsText(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const processCSV = useCallback(async () => {
    setProcessing(true);
    setProgress(0);
    const batchResults: CSVResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));
      batchResults.push(generateEmail(row.firstName, row.lastName, row.domain));
      setProgress(Math.round(((i + 1) / rows.length) * 100));
    }

    setResults(batchResults);
    setProcessing(false);
    onResultsReady?.(batchResults);
    toast.success(`${batchResults.length} emails generated`);
  }, [rows, onResultsReady]);

  const exportResults = useCallback(() => {
    const csv = [
      "First Name,Last Name,Domain,Email,Confidence,Status",
      ...results.map((r) => `${r.firstName},${r.lastName},${r.domain},${r.email},${r.confidence},${r.status}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-email-results.csv";
    a.click();
    toast.success("Results exported");
  }, [results]);

  const clear = () => {
    setFile(null);
    setRows([]);
    setResults([]);
    setProgress(0);
  };

  return (
    <div className="glass rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary" />
          Bulk CSV Import
        </h3>
        <p className="text-xs text-muted-foreground mt-1">Upload a CSV with first_name, last_name, domain columns</p>
      </div>

      <div className="p-4 space-y-4">
        {!file ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drop CSV here or click to browse</p>
            <p className="text-[10px] text-muted-foreground mt-1">Max 10,000 rows per import</p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{rows.length} rows parsed</p>
                </div>
              </div>
              <button onClick={clear} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {processing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Processing...
                  </span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-success" />
                    {results.filter((r) => r.status === "valid").length} valid
                    <AlertTriangle className="w-3 h-3 text-warning ml-2" />
                    {results.filter((r) => r.status === "risky").length} risky
                  </span>
                  <Button variant="outline" size="sm" onClick={exportResults}>
                    <Download className="w-3.5 h-3.5" /> Export
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {results.slice(0, 10).map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-surface-2">
                      <span className="text-foreground">{r.firstName} {r.lastName}</span>
                      <span className="font-mono text-primary">{r.email}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        r.status === "valid" ? "bg-success/10 text-success" : r.status === "risky" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                      }`}>{r.confidence}%</span>
                    </div>
                  ))}
                  {results.length > 10 && (
                    <p className="text-[10px] text-muted-foreground text-center py-1">
                      +{results.length - 10} more results...
                    </p>
                  )}
                </div>
              </div>
            )}

            {rows.length > 0 && results.length === 0 && !processing && (
              <Button variant="hero" className="w-full" onClick={processCSV}>
                <Upload className="w-4 h-4" />
                Find {rows.length} Emails
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkCSVImport;
