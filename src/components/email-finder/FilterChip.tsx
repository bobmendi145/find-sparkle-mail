import { X } from "lucide-react";

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

const FilterChip = ({ label, onRemove }: FilterChipProps) => {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-frappe-brown-light text-foreground text-xs font-medium border border-border transition-colors hover:bg-muted">
      {label}
      <button onClick={onRemove} className="text-muted-foreground hover:text-foreground transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
};

export default FilterChip;
