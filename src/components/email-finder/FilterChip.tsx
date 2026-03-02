import { X } from "lucide-react";

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

const FilterChip = ({ label, onRemove }: FilterChipProps) => {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20 transition-colors hover:bg-primary/20">
      {label}
      <button onClick={onRemove} className="hover:text-foreground transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
};

export default FilterChip;
