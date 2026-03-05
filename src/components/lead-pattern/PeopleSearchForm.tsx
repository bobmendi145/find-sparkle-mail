import { useState } from "react";
import { Search, User, Building2, Globe, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createPeopleSearchJob, PeopleSearchInput } from "@/lib/api/leadpattern";

interface PeopleSearchFormProps {
  onJobCreated: (jobId: string) => void;
}

const PeopleSearchForm = ({ onJobCreated }: PeopleSearchFormProps) => {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [maxProfiles, setMaxProfiles] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!role.trim()) {
      toast.error("Role is required");
      return;
    }

    setLoading(true);
    try {
      const input: PeopleSearchInput = {
        role: role.trim(),
        company: company.trim() || undefined,
        country: country.trim() || undefined,
        max_profiles: maxProfiles,
      };
      const jobId = await createPeopleSearchJob(input);
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-1.5">
          <label className="frappe-label">Role *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="e.g. CTO, VP Sales"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="frappe-label">Company</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="e.g. Google"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="frappe-label">Country</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="e.g. United States"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="frappe-label">Max Profiles</label>
          <Input
            type="number"
            min={1}
            max={100}
            value={maxProfiles}
            onChange={(e) => setMaxProfiles(Number(e.target.value) || 10)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="frappe-label">&nbsp;</label>
          <Button variant="frappe" className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Starting..." : "Find People"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PeopleSearchForm;
