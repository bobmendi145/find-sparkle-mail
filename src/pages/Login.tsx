import { useState } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) { toast.error(error.message); return; }
        toast.success("Welcome back!");
        navigate("/");
      } else {
        const { error } = await signUp(email, password);
        if (error) { toast.error(error.message); return; }
        toast.success("Check your email to confirm your account!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — Frappe editorial style */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center border-r border-border">
        <div className="max-w-md text-center px-12">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-8">
            <span className="text-primary-foreground font-bold text-xl font-serif">LP</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
            LeadPattern
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Find business and people emails with your own scraping &amp; enrichment logic. No paid APIs needed.
          </p>
          <div className="frappe-divider" />
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="text-xl font-semibold text-foreground">97%</div>
              <div>Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-foreground">200+</div>
              <div>Filters</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-foreground">50M+</div>
              <div>Contacts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-sm font-serif">LP</span>
            </div>
          </div>

          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {isLogin ? "Sign in to access LeadPattern" : "Start finding leads today"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="frappe-label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="frappe-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button variant="frappe" className="w-full" type="submit" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline font-medium"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
