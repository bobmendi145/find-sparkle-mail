import { useState, useRef, useCallback } from "react";
import { PanelLeftClose, PanelLeft, LogOut, ChevronRight } from "lucide-react";
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
      {/* Frappe-style top nav */}
      <nav className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">EF</span>
            </div>
            <span className="font-semibold text-foreground">Email Finder</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Search</span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </>
            ) : (
              <a href="/login" className="text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1">
                Log in or create account
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </nav>

      <HeroSection onScrollToSearch={scrollToSearch} />

      <div ref={searchRef} className="max-w-[1200px] mx-auto px-6 pb-20">
        <Tabs defaultValue="search" className="mb-6">
          <TabsList className="bg-muted border border-border rounded-full p-0.5">
            <TabsTrigger value="search" className="rounded-full text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Single Search
            </TabsTrigger>
            <TabsTrigger value="bulk" className="rounded-full text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Bulk CSV Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-6 space-y-6">
            <QuickSearchForm
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={handleSearch}
              isSearching={isSearching}
            />
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className="mb-3"
                >
                  {showFilters ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
                </Button>
                {showFilters && (
                  <div className="w-72 frappe-card overflow-hidden">
                    <FilterSidebar filters={filters} onFiltersChange={setFilters} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <ResultsTable results={results} isLoading={isSearching} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <BulkCSVImport />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Need to import ArrowRight for the nav
import { ArrowRight } from "lucide-react";

export default EmailFinder;
