import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  CrmProvider,
  CrmConnection,
  CRM_PROVIDERS,
  getCrmConnections,
  exportToCrm,
  ExportLeadPayload,
} from "@/lib/api/crm";

interface ExportToCrmButtonProps {
  getLeads: () => ExportLeadPayload["leads"];
  disabled?: boolean;
}

const ExportToCrmButton = ({ getLeads, disabled }: ExportToCrmButtonProps) => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<CrmConnection[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getCrmConnections().then(setConnections).catch(console.error);
  }, []);

  const activeConnections = connections.filter((c) => c.is_active);

  const handleExport = async (provider: CrmProvider) => {
    const leads = getLeads();
    if (leads.length === 0) {
      toast.error("No leads to export");
      return;
    }

    setExporting(true);
    try {
      const result = await exportToCrm({ provider, leads });
      if (result.success) {
        toast.success(`${result.exported} lead(s) exported to ${CRM_PROVIDERS[provider].name}`);
      } else {
        toast.error(`Export failed: ${result.errors?.join(", ") || "Unknown error"}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  if (activeConnections.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/integrations")}
        disabled={disabled}
      >
        <Send className="w-3.5 h-3.5" /> Connect CRM
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || exporting}>
          <Send className="w-3.5 h-3.5" /> {exporting ? "Exporting…" : "Send to CRM"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {activeConnections.map((conn) => (
          <DropdownMenuItem
            key={conn.id}
            onClick={() => handleExport(conn.provider)}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              {CRM_PROVIDERS[conn.provider].name}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportToCrmButton;
