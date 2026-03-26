import { ArrowRight, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Paywall = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Fonatica" className="w-12 h-12 mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
            Subscribe to continue
          </h1>
          <p className="text-sm text-muted-foreground">
            You need an active subscription to access Fonatica's lead generation tools.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 mb-6">
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-4xl font-bold text-foreground tracking-tight">$125</span>
              <span className="text-muted-foreground text-sm">/mo</span>
            </div>
            <p className="text-xs text-muted-foreground">Cancel anytime</p>
          </div>

          <ul className="space-y-2.5 text-sm text-muted-foreground mb-6">
            <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-primary shrink-0" /> Unlimited searches</li>
            <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-primary shrink-0" /> Real-time web scraping</li>
            <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-primary shrink-0" /> CSV export</li>
            <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-primary shrink-0" /> Email tracking & sending</li>
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

        <Button variant="ghost" size="sm" className="w-full" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default Paywall;
