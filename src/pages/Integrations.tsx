import { useState, useEffect } from "react";
import { ChevronRight, LogOut, Plug, Trash2, Check, Cloud, Mail, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CrmProvider,
  CrmConnection,
  CRM_PROVIDERS,
  getCrmConnections,
  upsertCrmConnection,
  deleteCrmConnection,
} from "@/lib/api/crm";
import {
  SesConnection,
  SES_REGIONS,
  getSesConnection,
  upsertSesConnection,
  deleteSesConnection,
} from "@/lib/api/ses";
import ScheduledEmailsQueue from "@/components/lead-pattern/ScheduledEmailsQueue";

const Integrations = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // CRM state
  const [connections, setConnections] = useState<CrmConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<CrmProvider | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [instanceUrl, setInstanceUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // SES state
  const [sesConn, setSesConn] = useState<SesConnection | null>(null);
  const [sesExpanded, setSesExpanded] = useState(false);
  const [sesAccessKey, setSesAccessKey] = useState("");
  const [sesSecretKey, setSesSecretKey] = useState("");
  const [sesRegion, setSesRegion] = useState("us-east-1");
  const [sesSenderEmail, setSesSenderEmail] = useState("");
  const [sesSaving, setSesSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getCrmConnections().then(setConnections).catch(console.error),
      getSesConnection().then(setSesConn).catch(console.error),
    ]).finally(() => setLoading(false));
  }, [user]);

  // CRM handlers
  const handleConnect = async (provider: CrmProvider) => {
    setSaving(true);
    try {
      const conn = await upsertCrmConnection(provider, apiKey, instanceUrl || undefined);
      setConnections((prev) => {
        const filtered = prev.filter((c) => c.provider !== provider);
        return [...filtered, conn];
      });
      setConnectingProvider(null);
      setApiKey("");
      setInstanceUrl("");
      toast.success(`${CRM_PROVIDERS[provider].name} connected`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async (conn: CrmConnection) => {
    try {
      await deleteCrmConnection(conn.id);
      setConnections((prev) => prev.filter((c) => c.id !== conn.id));
      toast.success(`${CRM_PROVIDERS[conn.provider].name} disconnected`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getConnection = (provider: CrmProvider) =>
    connections.find((c) => c.provider === provider && c.is_active);

  // SES handlers
  const handleSesSave = async () => {
    if (!sesAccessKey || !sesSecretKey || !sesSenderEmail) {
      toast.error("Please fill all required fields");
      return;
    }
    setSesSaving(true);
    try {
      const conn = await upsertSesConnection(sesAccessKey, sesSecretKey, sesRegion, sesSenderEmail);
      setSesConn(conn);
      setSesExpanded(false);
      toast.success("AWS SES connected");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSesSaving(false);
    }
  };

  const handleSesDisconnect = async () => {
    if (!sesConn) return;
    try {
      await deleteSesConnection(sesConn.id);
      setSesConn(null);
      setSesAccessKey("");
      setSesSecretKey("");
      setSesSenderEmail("");
      toast.success("AWS SES disconnected");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-background sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <img src="/logo.png" alt="LeadPattern" className="w-6 h-6" />
            <span className="font-semibold text-foreground cursor-pointer" onClick={() => navigate("/dashboard")}>
              LeadPattern
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Integrations</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <span className="text-xs text-muted-foreground">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-[800px] mx-auto px-6 py-10 space-y-12">
        {/* ─── Email Sending ─── */}
        <section>
          <div className="mb-6">
            <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Email Sending</h1>
            <p className="text-sm text-muted-foreground">
              Connect your Amazon SES account to send emails directly to your leads.
            </p>
          </div>

          {loading ? (
            <div className="frappe-card p-12 text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="frappe-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Cloud className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Amazon SES</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Send outreach emails to discovered leads using Amazon Simple Email Service.
                    </p>
                    {sesConn && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-2 h-2 rounded-full bg-success" />
                        <span className="text-xs text-success font-medium">Connected</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {sesConn.sender_email} · {sesConn.region}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {sesConn ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSesExpanded(true);
                          setSesAccessKey(sesConn.access_key_id);
                          setSesSecretKey(sesConn.secret_access_key);
                          setSesRegion(sesConn.region);
                          setSesSenderEmail(sesConn.sender_email);
                        }}
                      >
                        Update
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={handleSesDisconnect}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSesExpanded(!sesExpanded)}
                    >
                      {sesExpanded ? "Cancel" : "Connect"}
                    </Button>
                  )}
                </div>
              </div>

              {sesExpanded && (
                <div className="mt-5 pt-5 border-t border-border space-y-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Go to <strong>AWS Console → IAM → Users</strong> → create or select a user with <code>AmazonSESFullAccess</code> policy →
                      create an Access Key under Security Credentials. Your sender email/domain must be verified in SES.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Access Key ID</Label>
                      <Input
                        type="password"
                        placeholder="AKIAIOSFODNN7EXAMPLE"
                        value={sesAccessKey}
                        onChange={(e) => setSesAccessKey(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Secret Access Key</Label>
                      <Input
                        type="password"
                        placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                        value={sesSecretKey}
                        onChange={(e) => setSesSecretKey(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">SES Region</Label>
                      <Select value={sesRegion} onValueChange={setSesRegion}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SES_REGIONS.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Verified Sender Email</Label>
                      <Input
                        type="email"
                        placeholder="outreach@yourdomain.com"
                        value={sesSenderEmail}
                        onChange={(e) => setSesSenderEmail(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={!sesAccessKey || !sesSecretKey || !sesSenderEmail || sesSaving}
                    onClick={handleSesSave}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {sesSaving ? "Saving…" : "Save Connection"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ─── Scheduled Emails ─── */}
        <section>
          <div className="mb-4">
            <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Scheduled Emails
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Emails queued for delivery. Checked every minute.
            </p>
          </div>
          <ScheduledEmailsQueue />
        </section>

        <Separator />
        <section>
          <div className="mb-6">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">CRM Integrations</h2>
            <p className="text-sm text-muted-foreground">
              Connect your CRM to push leads directly from search results.
            </p>
          </div>

          {loading ? (
            <div className="frappe-card p-12 text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="grid gap-4">
              {(Object.entries(CRM_PROVIDERS) as [CrmProvider, typeof CRM_PROVIDERS[CrmProvider]][]).map(
                ([provider, meta]) => {
                  const conn = getConnection(provider);
                  const isConnecting = connectingProvider === provider;

                  return (
                    <div key={provider} className="frappe-card p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Plug className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-foreground">{meta.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
                            {conn && (
                              <div className="flex items-center gap-1.5 mt-2">
                                <div className="w-2 h-2 rounded-full bg-success" />
                                <span className="text-xs text-success font-medium">Connected</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  Key: ···{conn.api_key.slice(-4)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {conn ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setConnectingProvider(provider);
                                  setApiKey(conn.api_key);
                                  setInstanceUrl(conn.instance_url || "");
                                }}
                              >
                                Update
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDisconnect(conn)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setConnectingProvider(isConnecting ? null : provider);
                                setApiKey("");
                                setInstanceUrl("");
                              }}
                            >
                              {isConnecting ? "Cancel" : "Connect"}
                            </Button>
                          )}
                        </div>
                      </div>

                      {isConnecting && (
                        <div className="mt-5 pt-5 border-t border-border space-y-4">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {meta.apiKeyHelp}
                            </p>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs">{meta.apiKeyLabel}</Label>
                              <Input
                                type="password"
                                placeholder="Paste your token here…"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            {meta.requiresInstanceUrl && (
                              <div>
                                <Label className="text-xs">Instance URL</Label>
                                <Input
                                  type="url"
                                  placeholder="https://your-instance.example.com"
                                  value={instanceUrl}
                                  onChange={(e) => setInstanceUrl(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                            )}
                            <Button
                              size="sm"
                              disabled={!apiKey || saving}
                              onClick={() => handleConnect(provider)}
                            >
                              <Check className="w-3.5 h-3.5" />
                              {saving ? "Saving…" : "Save Connection"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Integrations;
