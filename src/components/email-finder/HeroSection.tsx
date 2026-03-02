import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onScrollToSearch: () => void;
}

const HeroSection = ({ onScrollToSearch }: HeroSectionProps) => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <p className="frappe-label mb-6">Email Finder</p>

        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
          Find anyone's email address
        </h1>

        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          Search by name, domain, or use 200+ filters to find verified professional email addresses.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="frappe" size="lg" onClick={onScrollToSearch}>
            <Search className="w-4 h-4" />
            Start finding emails
          </Button>
          <Button variant="frappe-outline" size="lg" onClick={onScrollToSearch}>
            View demo
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="frappe-divider" />

        <div className="flex items-center justify-center gap-10 text-sm text-muted-foreground">
          <div>
            <span className="text-foreground font-semibold">97%</span> accuracy
          </div>
          <div>
            <span className="text-foreground font-semibold">200+</span> filters
          </div>
          <div>
            <span className="text-foreground font-semibold">CSV</span> export
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
