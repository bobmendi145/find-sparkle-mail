import { Search, ArrowRight, Zap, Shield, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-background sticky top-0 z-40">
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Fonatica" className="w-7 h-7" />
            <span className="font-serif font-bold text-foreground text-lg">Fonatica</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
              Pricing
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Sign in
            </Button>
            <Button variant="frappe" size="sm" onClick={() => navigate("/login")}>
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero — split layout */}
      <section className="min-h-[calc(100vh-57px)] flex flex-col lg:flex-row">
        {/* Left side */}
        <div className="flex-1 flex items-center justify-center border-r border-border px-6 py-20 lg:py-0">
          <div className="max-w-md text-center">
            <img src="/logo.png" alt="Fonatica" className="w-14 h-14 mx-auto mb-8" />
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Fonatica
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Find verified emails for any business or person with real-time web scraping & intelligent pattern matching.
            </p>
            <div className="frappe-divider" />
            <div className="flex justify-center gap-8 text-sm text-muted-foreground">
              <div className="text-center">
                <div className="text-xl font-semibold text-foreground">Real-time</div>
                <div>Scraping</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-foreground">Pattern</div>
                <div>Matching</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-foreground">CSV</div>
                <div>Export</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex-1 flex items-center justify-center px-6 py-20 lg:py-0 bg-secondary/20">
          <div className="max-w-sm w-full text-center">
            <p className="frappe-label mb-5">Lead Generation Platform</p>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
              Start finding leads today
            </h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              No stale databases — fresh results every time. Sign up and start searching in seconds.
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="frappe" size="lg" className="w-full" onClick={() => navigate("/login")}>
                <Search className="w-4 h-4" />
                Start Finding Leads
              </Button>
              <Button variant="frappe-outline" size="lg" className="w-full" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 border-t border-border bg-secondary/30">
        <div className="max-w-[1000px] mx-auto">
          <p className="frappe-label text-center mb-4">How it works</p>
          <h2 className="font-serif text-3xl font-bold text-foreground text-center mb-14">
            Two powerful search modes
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-3">Business Email Search</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Enter an industry, location, and keywords. We scrape the web in real-time to find businesses and extract their contact emails from websites.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-primary" /> Live web scraping via Firecrawl</li>
                <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-primary" /> Email extraction from websites</li>
                <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-primary" /> Industry & location targeting</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-8">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-3">People Email Search</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Search by role, company, or name. We find LinkedIn profiles, discover domain email patterns, and generate verified email guesses.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-primary" /> LinkedIn profile discovery</li>
                <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-primary" /> Domain pattern detection</li>
                <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-primary" /> Smart email generation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 border-t border-border">
        <div className="max-w-[600px] mx-auto text-center">
          <p className="frappe-label mb-4">Pricing</p>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
            One plan. Everything included.
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-10">
            No tiers, no hidden fees. Get full access to every feature.
          </p>

          <div className="bg-card border border-border rounded-xl p-10 max-w-sm mx-auto text-left">
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-5xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>$125</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              <p className="text-xs text-muted-foreground">Billed monthly. Cancel anytime.</p>
            </div>

            <div className="frappe-divider" />

            <ul className="space-y-3 text-sm text-muted-foreground mb-8">
              <li className="flex items-center gap-2.5"><Zap className="w-3.5 h-3.5 text-primary shrink-0" /> Unlimited business & people searches</li>
              <li className="flex items-center gap-2.5"><Zap className="w-3.5 h-3.5 text-primary shrink-0" /> Real-time web scraping</li>
              <li className="flex items-center gap-2.5"><Zap className="w-3.5 h-3.5 text-primary shrink-0" /> CSV export for all results</li>
              <li className="flex items-center gap-2.5"><Zap className="w-3.5 h-3.5 text-primary shrink-0" /> Domain pattern detection</li>
              <li className="flex items-center gap-2.5"><Shield className="w-3.5 h-3.5 text-primary shrink-0" /> Private & encrypted data</li>
            </ul>

            <a
              href="https://buy.stripe.com/8x228r9hRfo73B26C37Zu0c"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full h-10 px-7 bg-foreground text-background rounded-full font-medium text-sm hover:opacity-90 transition-all duration-150"
            >
              Subscribe Now <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Fonatica" className="w-5 h-5" />
            <span>Fonatica</span>
          </div>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
