import { useState, useEffect, useCallback } from "react";
import { ChevronRight, LogOut, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import BusinessSearchForm from "@/components/lead-pattern/BusinessSearchForm";
import PeopleSearchForm from "@/components/lead-pattern/PeopleSearchForm";
import BusinessResultsTable from "@/components/lead-pattern/BusinessResultsTable";
import PeopleResultsTable from "@/components/lead-pattern/PeopleResultsTable";
import JobHistory from "@/components/lead-pattern/JobHistory";
import LeadDetailPanel from "@/components/lead-pattern/LeadDetailPanel";
import {
  getJobs,
  getBusinessLeads,
  getPeopleLeads,
  subscribeToJob,
  SearchJob,
  BusinessLead,
  PeopleLead,
} from "@/lib/api/leadpattern";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("business");
  const [businessJobs, setBusinessJobs] = useState<SearchJob[]>([]);
  const [peopleJobs, setPeopleJobs] = useState<SearchJob[]>([]);
  const [activeBusinessJobId, setActiveBusinessJobId] = useState<string>();
  const [activePeopleJobId, setActivePeopleJobId] = useState<string>();
  const [businessLeads, setBusinessLeads] = useState<BusinessLead[]>([]);
  const [peopleLeads, setPeopleLeads] = useState<PeopleLead[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [detailLead, setDetailLead] = useState<Record<string, any> | null>(null);

  // Load jobs on mount

  // Load jobs on mount
  useEffect(() => {
    if (!user) return;
    getJobs("business").then(setBusinessJobs).catch(console.error);
    getJobs("people").then(setPeopleJobs).catch(console.error);
  }, [user]);

  // Load results when active job changes
  useEffect(() => {
    if (!activeBusinessJobId) return;
    setLoadingResults(true);
    getBusinessLeads(activeBusinessJobId)
      .then(setBusinessLeads)
      .finally(() => setLoadingResults(false));
  }, [activeBusinessJobId]);

  useEffect(() => {
    if (!activePeopleJobId) return;
    setLoadingResults(true);
    getPeopleLeads(activePeopleJobId)
      .then(setPeopleLeads)
      .finally(() => setLoadingResults(false));
  }, [activePeopleJobId]);

  const handleBusinessJobCreated = useCallback((jobId: string) => {
    setActiveBusinessJobId(jobId);
    setLoadingResults(true);

    // Subscribe to status changes
    const unsub = subscribeToJob(jobId, (updatedJob) => {
      setBusinessJobs((prev) =>
        prev.map((j) => (j.id === jobId ? updatedJob : j))
      );
      if (updatedJob.status === "completed" || updatedJob.status === "failed") {
        unsub();
        if (updatedJob.status === "completed") {
          getBusinessLeads(jobId).then(setBusinessLeads);
        }
        setLoadingResults(false);
      }
    });

    // Add to job list immediately
    setBusinessJobs((prev) => [
      { id: jobId, type: "business", input_json: {}, status: "pending", error_message: null, results_count: 0, created_at: new Date().toISOString(), completed_at: null },
      ...prev,
    ]);

    // Also poll as fallback
    const pollInterval = setInterval(async () => {
      const jobs = await getJobs("business");
      setBusinessJobs(jobs);
      const job = jobs.find((j) => j.id === jobId);
      if (job && (job.status === "completed" || job.status === "failed")) {
        clearInterval(pollInterval);
        if (job.status === "completed") {
          getBusinessLeads(jobId).then(setBusinessLeads);
        }
        setLoadingResults(false);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, []);

  const handlePeopleJobCreated = useCallback((jobId: string) => {
    setActivePeopleJobId(jobId);
    setLoadingResults(true);

    const unsub = subscribeToJob(jobId, (updatedJob) => {
      setPeopleJobs((prev) =>
        prev.map((j) => (j.id === jobId ? updatedJob : j))
      );
      if (updatedJob.status === "completed" || updatedJob.status === "failed") {
        unsub();
        if (updatedJob.status === "completed") {
          getPeopleLeads(jobId).then(setPeopleLeads);
        }
        setLoadingResults(false);
      }
    });

    setPeopleJobs((prev) => [
      { id: jobId, type: "people", input_json: {}, status: "pending", error_message: null, results_count: 0, created_at: new Date().toISOString(), completed_at: null },
      ...prev,
    ]);

    const pollInterval = setInterval(async () => {
      const jobs = await getJobs("people");
      setPeopleJobs(jobs);
      const job = jobs.find((j) => j.id === jobId);
      if (job && (job.status === "completed" || job.status === "failed")) {
        clearInterval(pollInterval);
        if (job.status === "completed") {
          getPeopleLeads(jobId).then(setPeopleLeads);
        }
        setLoadingResults(false);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-background sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <img src="/logo.png" alt="LeadPattern" className="w-6 h-6" />
            <span className="font-semibold text-foreground">LeadPattern</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/integrations")}>
              <Plug className="w-3.5 h-3.5" /> Integrations
            </Button>
            <span className="text-xs text-muted-foreground">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-[1200px] mx-auto px-6 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="bg-muted border border-border rounded-full p-0.5">
            <TabsTrigger value="business" className="rounded-full text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Business Emails
            </TabsTrigger>
            <TabsTrigger value="people" className="rounded-full text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
              People Emails
            </TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="mt-6 space-y-6">
            <BusinessSearchForm onJobCreated={handleBusinessJobCreated} />
            <JobHistory
              jobs={businessJobs}
              onSelectJob={(id) => setActiveBusinessJobId(id)}
              activeJobId={activeBusinessJobId}
            />
            <BusinessResultsTable
              leads={businessLeads}
              isLoading={loadingResults && activeTab === "business"}
              onSelectLead={(lead) => setDetailLead(lead)}
            />
          </TabsContent>

          <TabsContent value="people" className="mt-6 space-y-6">
            <PeopleSearchForm onJobCreated={handlePeopleJobCreated} />
            <JobHistory
              jobs={peopleJobs}
              onSelectJob={(id) => setActivePeopleJobId(id)}
              activeJobId={activePeopleJobId}
            />
            <PeopleResultsTable
              leads={peopleLeads}
              isLoading={loadingResults && activeTab === "people"}
              onSelectLead={(lead) => setDetailLead(lead)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail panel */}
      <LeadDetailPanel lead={detailLead} onClose={() => setDetailLead(null)} />
    </div>
  );
};

export default Dashboard;
