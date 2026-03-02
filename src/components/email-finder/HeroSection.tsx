import { Search, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onScrollToSearch: () => void;
}

const HeroSection = ({ onScrollToSearch }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden py-20 px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--glow)/0.08),transparent_60%)]" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8">
          <Zap className="w-3.5 h-3.5" />
          Apollo-style filters • Hunter-grade verification
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          <span className="gradient-text">Email Finder</span>
          <br />
          <span className="text-foreground/90">on Steroids</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Find verified emails with 200+ enrichment filters. Target by title, tech stack, funding stage, buying signals, and more.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="xl" onClick={onScrollToSearch}>
            <Search className="w-5 h-5" />
            Start Finding Emails
          </Button>
          <Button variant="glass" size="xl" onClick={onScrollToSearch}>
            View Demo
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            97% accuracy
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            200+ filters
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            Bulk CSV export
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
