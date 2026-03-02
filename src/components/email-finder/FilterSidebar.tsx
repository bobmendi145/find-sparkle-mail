import { useState } from "react";
import {
  Users, Building2, TrendingUp, Settings2,
  ChevronDown, Sparkles
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { SearchFilters } from "@/types/emailFinder";
import { FILTER_DATA } from "@/data/filterData";
import FilterChip from "./FilterChip";

interface FilterSidebarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const MultiSelect = ({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) => {
  const [search, setSearch] = useState("");
  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (val: string) => {
    onChange(
      selected.includes(val)
        ? selected.filter((s) => s !== val)
        : [...selected, val]
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        {selected.length > 0 && (
          <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
            {selected.length}
          </Badge>
        )}
      </div>
      <Input
        placeholder={`Search ${label.toLowerCase()}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-8 text-xs bg-surface-2 border-border"
      />
      <ScrollArea className="h-36">
        <div className="space-y-1 pr-3">
          {filtered.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 py-1 px-2 rounded text-sm cursor-pointer hover:bg-surface-2 transition-colors"
            >
              <Checkbox
                checked={selected.includes(opt)}
                onCheckedChange={() => toggle(opt)}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-secondary-foreground text-xs">{opt}</span>
            </label>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

const FilterSidebar = ({ filters, onFiltersChange }: FilterSidebarProps) => {
  const update = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeCount =
    filters.titles.length + filters.seniority.length + filters.departments.length +
    filters.countries.length + filters.industries.length + filters.techStack.length +
    filters.employeeRanges.length + filters.revenueRanges.length + filters.fundingStages.length +
    (filters.keywords ? 1 : 0);

  const applyPreset = (preset: typeof FILTER_DATA.presets[0]) => {
    onFiltersChange({
      ...filters,
      titles: preset.filters.titles || [],
      industries: preset.filters.industries || [],
      countries: preset.filters.countries || [],
      techStack: preset.filters.techStack || [],
    });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            Advanced Filters
          </h3>
          {activeCount > 0 && (
            <Badge className="bg-primary text-primary-foreground text-[10px]">
              {activeCount} active
            </Badge>
          )}
        </div>
        {/* Presets */}
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Quick Presets</span>
          <div className="flex flex-wrap gap-1">
            {FILTER_DATA.presets.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className="text-[10px] px-2 py-1 rounded border border-border bg-surface-2 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                <Sparkles className="w-2.5 h-2.5 inline mr-1" />
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Accordion type="multiple" defaultValue={["people", "company"]} className="space-y-2">
            {/* PEOPLE */}
            <AccordionItem value="people" className="border border-border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline hover:bg-surface-2 data-[state=open]:bg-surface-2">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  People Filters
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <MultiSelect
                  label="Title / Persona"
                  options={FILTER_DATA.personaTitles}
                  selected={filters.titles}
                  onChange={(v) => update("titles", v)}
                />
                <MultiSelect
                  label="Seniority"
                  options={FILTER_DATA.seniority}
                  selected={filters.seniority}
                  onChange={(v) => update("seniority", v)}
                />
                <MultiSelect
                  label="Department"
                  options={FILTER_DATA.departments}
                  selected={filters.departments}
                  onChange={(v) => update("departments", v)}
                />
                <MultiSelect
                  label="Location"
                  options={FILTER_DATA.countries}
                  selected={filters.countries}
                  onChange={(v) => update("countries", v)}
                />
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Keywords</span>
                  <Input
                    placeholder="AI, machine learning, fintech..."
                    value={filters.keywords}
                    onChange={(e) => update("keywords", e.target.value)}
                    className="h-8 text-xs bg-surface-2 border-border"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* COMPANY */}
            <AccordionItem value="company" className="border border-border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline hover:bg-surface-2 data-[state=open]:bg-surface-2">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-accent" />
                  Company Filters
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <MultiSelect
                  label="Industry"
                  options={FILTER_DATA.industries}
                  selected={filters.industries}
                  onChange={(v) => update("industries", v)}
                />
                <MultiSelect
                  label="Employee Count"
                  options={FILTER_DATA.employeeRanges}
                  selected={filters.employeeRanges}
                  onChange={(v) => update("employeeRanges", v)}
                />
                <MultiSelect
                  label="Revenue"
                  options={FILTER_DATA.revenueRanges}
                  selected={filters.revenueRanges}
                  onChange={(v) => update("revenueRanges", v)}
                />
                <MultiSelect
                  label="Tech Stack"
                  options={FILTER_DATA.techStack}
                  selected={filters.techStack}
                  onChange={(v) => update("techStack", v)}
                />
                <MultiSelect
                  label="Funding Stage"
                  options={FILTER_DATA.fundingStages}
                  selected={filters.fundingStages}
                  onChange={(v) => update("fundingStages", v)}
                />
              </AccordionContent>
            </AccordionItem>

            {/* SIGNALS */}
            <AccordionItem value="signals" className="border border-border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline hover:bg-surface-2 data-[state=open]:bg-surface-2">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  Buying Signals
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="text-xs text-muted-foreground p-3 rounded-lg bg-surface-2 border border-border text-center">
                  <Sparkles className="w-4 h-4 mx-auto mb-2 text-primary" />
                  Intent signals, hiring triggers, and growth indicators available with Lovable Cloud integration.
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>

      {/* Active filters chips */}
      {activeCount > 0 && (
        <div className="p-4 border-t border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Active Filters</span>
            <button
              onClick={() => onFiltersChange({
                ...filters,
                titles: [], seniority: [], departments: [], countries: [],
                industries: [], techStack: [], employeeRanges: [], revenueRanges: [],
                fundingStages: [], keywords: "",
              })}
              className="text-[10px] text-destructive hover:underline"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {filters.titles.map((t) => (
              <FilterChip key={t} label={t} onRemove={() => update("titles", filters.titles.filter((x) => x !== t))} />
            ))}
            {filters.seniority.map((t) => (
              <FilterChip key={t} label={t} onRemove={() => update("seniority", filters.seniority.filter((x) => x !== t))} />
            ))}
            {filters.departments.map((t) => (
              <FilterChip key={t} label={t} onRemove={() => update("departments", filters.departments.filter((x) => x !== t))} />
            ))}
            {filters.industries.map((t) => (
              <FilterChip key={t} label={t} onRemove={() => update("industries", filters.industries.filter((x) => x !== t))} />
            ))}
            {filters.techStack.map((t) => (
              <FilterChip key={t} label={t} onRemove={() => update("techStack", filters.techStack.filter((x) => x !== t))} />
            ))}
            {filters.countries.map((t) => (
              <FilterChip key={t} label={t} onRemove={() => update("countries", filters.countries.filter((x) => x !== t))} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;
