import { useEffect, useState } from "react";
import { X, Mail, Building2, MapPin, Globe, Linkedin, User, Briefcase, Copy, ExternalLink, Tag, ShieldCheck, ShieldAlert, ShieldQuestion, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { verifyEmails, getCachedVerifications, VerifyResult } from "@/lib/api/verify";

interface LeadDetailPanelProps {
  lead: Record<string, any> | null;
  onClose: () => void;
}

const InfoRow = ({ icon: Icon, label, value, copyable, isLink }: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  copyable?: boolean;
  isLink?: boolean;
}) => {
  if (!value || value === "—") return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  return (
    <div className="flex items-start gap-3 py-2.5 group">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
        {isLink ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1 mt-0.5"
          >
            {value.replace(/^https?:\/\//, "")}
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <p className="text-sm text-foreground mt-0.5 break-all">{value}</p>
        )}
      </div>
      {copyable && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={handleCopy}
        >
          <Copy className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
};

const statusMeta = (status?: string) => {
  switch (status) {
    case "valid": return { icon: ShieldCheck, label: "Valid", cls: "bg-success/10 text-success border-success/20" };
    case "invalid": return { icon: ShieldAlert, label: "Invalid", cls: "bg-destructive/10 text-destructive border-destructive/20" };
    case "catch-all":
    case "do_not_mail":
    case "spamtrap":
    case "abuse":
    case "unknown": return { icon: ShieldQuestion, label: status === "unknown" ? "Unknown" : status, cls: "bg-warning/10 text-warning border-warning/20" };
    default: return null;
  }
};

const EmailRow = ({ email, verification, onVerify, verifying }: {
  email: string;
  verification?: VerifyResult;
  onVerify: (email: string, force: boolean) => void;
  verifying: boolean;
}) => {
  const meta = statusMeta(verification?.status);
  const Icon = meta?.icon;
  return (
    <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-md bg-muted border border-border">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-medium text-foreground truncate">{email}</span>
        {meta && Icon && (
          <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${meta.cls} shrink-0`}>
            <Icon className="w-2.5 h-2.5" /> {meta.label}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(email); toast.success("Copied"); }}>
          <Copy className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          disabled={verifying}
          title={verification ? "Re-verify" : "Verify"}
          onClick={() => onVerify(email, !!verification)}
        >
          {verifying ? <Loader2 className="w-3 h-3 animate-spin" /> : verification ? <RefreshCw className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
        </Button>
      </div>
    </div>
  );
};

const LeadDetailPanel = ({ lead, onClose }: LeadDetailPanelProps) => {
  if (!lead) return null;

  // Detect if it's a person or business lead
  const isPerson = !!lead.full_name;
  const name = lead.full_name || lead.name || "Unknown";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const emails: string[] = isPerson
    ? [lead.primary_email, ...(lead.generated_emails || [])].filter(Boolean)
    : (lead.emails || []);

  return (
    <Sheet open={!!lead} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[420px] sm:w-[420px] p-0 border-l border-border">
        <SheetHeader className="sr-only">
          <SheetTitle>Lead Details</SheetTitle>
        </SheetHeader>

        {/* Hero header */}
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-lg">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground leading-tight">{name}</h2>
              {isPerson && lead.role && (
                <p className="text-sm text-muted-foreground mt-0.5">{lead.role}</p>
              )}
              {isPerson && lead.company && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {lead.company}
                </p>
              )}
              {!isPerson && lead.industry && (
                <Badge variant="secondary" className="mt-2 text-[10px]">
                  {lead.industry}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Emails section */}
        {emails.length > 0 && (
          <div className="px-6 py-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2.5">
              {isPerson ? "Email Addresses" : "Business Emails"}
            </p>
            <div className="flex flex-wrap gap-2">
              {emails.map((email: string, i: number) => (
                <EmailBadge key={i} email={email} />
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Details section */}
        <div className="px-6 py-4 space-y-0.5 overflow-y-auto flex-1">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Details</p>

          {isPerson ? (
            <>
              <InfoRow icon={User} label="First Name" value={lead.first_name} />
              <InfoRow icon={User} label="Last Name" value={lead.last_name} />
              <InfoRow icon={Briefcase} label="Role / Title" value={lead.role} />
              <InfoRow icon={Building2} label="Company" value={lead.company} />
              <InfoRow icon={Globe} label="Domain" value={lead.domain} isLink />
              <InfoRow icon={MapPin} label="Country" value={lead.country} />
              <InfoRow icon={Linkedin} label="LinkedIn" value={lead.source_url} isLink />
              <InfoRow icon={Tag} label="Source Query" value={lead.source_query} />
            </>
          ) : (
            <>
              <InfoRow icon={Building2} label="Business Name" value={lead.name} copyable />
              <InfoRow icon={Tag} label="Industry" value={lead.industry} />
              <InfoRow icon={MapPin} label="Location" value={lead.location} />
              <InfoRow icon={Globe} label="Website" value={lead.website} isLink />
              <InfoRow icon={Tag} label="Source" value={lead.source} />
            </>
          )}
        </div>

        {/* Raw data toggle */}
        {lead.raw_data && (
          <>
            <Separator />
            <details className="px-6 py-4">
              <summary className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors">
                Raw Data
              </summary>
              <pre className="text-[10px] text-muted-foreground bg-muted p-3 rounded-lg mt-2 overflow-auto whitespace-pre-wrap break-all max-h-48">
                {JSON.stringify(lead.raw_data, null, 2)}
              </pre>
            </details>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default LeadDetailPanel;
