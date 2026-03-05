import { useState } from "react";
import { Search, MapPin, Building2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createBusinessSearchJob, BusinessSearchInput } from "@/lib/api/leadpattern";

interface BusinessSearchFormProps {
  onJobCreated: (jobId: string) => void;
}

const BusinessSearchForm = ({ onJobCreated }: BusinessSearchFormProps) => {
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [maxResults, setMaxResults] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!industry.trim()) {
      toast.error("Industry is required");
      return;
    }
    if (!location.trim()) {
      toast.error("Location is required");
      return;
    }

    setLoading(true);
    try {
      const input: BusinessSearchInput = {
        industry: industry.trim(),
        location: location.trim(),
        max_results: maxResults,
      };
      const jobId = await createBusinessSearchJob(input);
      toast.success("Search job started!");
      onJobCreated(jobId);
    } catch (err: any) {
      toast.error(err.message || "Failed to start search");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="frappe-card p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="frappe-label">Industry</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="e.g. Restaurant, Plumber"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="frappe-label">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="e.g. San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="frappe-label">Max Results</label>
          <Input
            type="number"
            min={1}
            max={100}
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value) || 10)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="frappe-label">&nbsp;</label>
          <Button variant="frappe" className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Starting..." : "Find Businesses"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BusinessSearchForm;
