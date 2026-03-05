import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LeadDetailPanelProps {
  lead: Record<string, any> | null;
  onClose: () => void;
}

const LeadDetailPanel = ({ lead, onClose }: LeadDetailPanelProps) => {
  if (!lead) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-xl z-50 flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Lead Details</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <pre className="text-xs text-foreground bg-muted p-4 rounded-lg overflow-auto whitespace-pre-wrap break-all">
          {JSON.stringify(lead, null, 2)}
        </pre>
      </ScrollArea>
    </div>
  );
};

export default LeadDetailPanel;
