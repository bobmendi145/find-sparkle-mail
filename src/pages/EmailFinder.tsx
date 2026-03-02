import { useState, useRef, useCallback } from "react";
import { PanelLeftClose, PanelLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeroSection from "@/components/email-finder/HeroSection";
import QuickSearchForm from "@/components/email-finder/QuickSearchForm";
import FilterSidebar from "@/components/email-finder/FilterSidebar";
import ResultsTable from "@/components/email-finder/ResultsTable";
import BulkCSVImport from "@/components/email-finder/BulkCSVImport";
import { SearchFilters, defaultFilters, EmailResult } from "@/types/emailFinder";
import { generateMockResults } from "@/data/mockResults";
import { useAuth } from "@/hooks/useAuth";

const EmailFinder = () => {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [results, setResults] = useState<EmailResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  const scrollToSearch = useCallback(() => {
    searchRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSearch = useCallback(() => {
    setIsSearching(true);
    setTimeout(() => {
      setResults(generateMockResults(30));
      setIsSearching(false);
    }, 1500);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="border-b border-border glass sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">EF</span>
            </div>
            <span className="font-semibold text-foreground">Email Finder</span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/login">Sign In</a>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <a href="/login">Get Started</a>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <HeroSection onScrollToSearch={scrollToSearch} />

      <div ref={searchRef} className="max-w-[1600px] mx-auto px-4 pb-20">
        {/* Tabs: Search vs Bulk Import */}
        <Tabs defaultValue="search" className="mb-6">
          <TabsList className="bg-surface-2 border border-border">
            <TabsTrigger value="search" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Single Search
            </TabsTrigger>
            <TabsTrigger value="bulk" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Bulk CSV Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-4 space-y-6">
            <QuickSearchForm
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={handleSearch}
              isSearching={isSearching}
            />
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className="mb-4"
                >
                  {showFilters ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
                </Button>
                {showFilters && (
                  <div className="w-72 glass rounded-xl border border-border overflow-hidden">
                    <FilterSidebar filters={filters} onFiltersChange={setFilters} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <ResultsTable results={results} isLoading={isSearching} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="mt-4">
            <div className="max-w-2xl mx-auto">
              <BulkCSVImport />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmailFinder;
