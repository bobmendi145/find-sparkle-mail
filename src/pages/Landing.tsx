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
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs font-serif">LP</span>
            </div>
            <span className="font-serif font-bold text-foreground text-lg">LeadPattern</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Sign in
            </Button>
            <Button variant="frappe" size="sm" onClick={() => navigate("/login")}>
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-[700px] mx-auto text-center">
          <p className="frappe-label mb-5">Lead Generation Platform</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Find verified emails for any business or person
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Real-time web scraping and intelligent pattern matching to discover professional email addresses. No stale databases — fresh results every time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="frappe" size="lg" onClick={() => navigate("/login")}>
              <Search className="w-4 h-4" />
              Start Finding Leads
            </Button>
            <Button variant="frappe-outline" size="lg" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
              Learn More
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="frappe-divider" />

          <div className="flex items-center justify-center gap-10 text-sm text-muted-foreground">
            <div><span className="text-foreground font-semibold">Real-time</span> scraping</div>
            <div><span className="text-foreground font-semibold">Pattern</span> matching</div>
            <div><span className="text-foreground font-semibold">CSV</span> export</div>
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

      {/* Security */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-[600px] mx-auto text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
            Secure & private
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Your searches and results are private to your account. All data is encrypted and stored securely. We never share or sell your lead data.
          </p>
          <Button variant="frappe" size="lg" onClick={() => navigate("/login")}>
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-[10px] font-serif">LP</span>
            </div>
            <span>LeadPattern</span>
          </div>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
