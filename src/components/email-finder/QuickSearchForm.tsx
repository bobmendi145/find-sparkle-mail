import { useState } from "react";
import { Search, User, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchFilters } from "@/types/emailFinder";

interface QuickSearchFormProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  isSearching: boolean;
}

const QuickSearchForm = ({ filters, onFiltersChange, onSearch, isSearching }: QuickSearchFormProps) => {
  const update = (key: keyof SearchFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="glass rounded-xl p-6 glow-border">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">First Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="John"
              value={filters.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className="pl-10 bg-surface-2 border-border focus:border-primary focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Doe"
              value={filters.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className="pl-10 bg-surface-2 border-border focus:border-primary focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Domain</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="company.com"
              value={filters.domain}
              onChange={(e) => update("domain", e.target.value)}
              className="pl-10 bg-surface-2 border-border focus:border-primary focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">&nbsp;</label>
          <Button variant="hero" className="w-full" onClick={onSearch} disabled={isSearching}>
            <Search className="w-4 h-4" />
            {isSearching ? "Searching..." : "Find Emails"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickSearchForm;
