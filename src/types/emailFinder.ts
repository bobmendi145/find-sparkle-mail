export interface EmailResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  company: string;
  domain: string;
  confidence: number;
  status: "valid" | "risky" | "unknown";
  department: string;
  seniority: string;
  location: string;
  industry: string;
  companySize: string;
  linkedinUrl?: string;
}

export interface SearchFilters {
  firstName: string;
  lastName: string;
  domain: string;
  titles: string[];
  seniority: string[];
  departments: string[];
  countries: string[];
  industries: string[];
  techStack: string[];
  employeeRanges: string[];
  revenueRanges: string[];
  fundingStages: string[];
  keywords: string;
}

export const defaultFilters: SearchFilters = {
  firstName: "",
  lastName: "",
  domain: "",
  titles: [],
  seniority: [],
  departments: [],
  countries: [],
  industries: [],
  techStack: [],
  employeeRanges: [],
  revenueRanges: [],
  fundingStages: [],
  keywords: "",
};
