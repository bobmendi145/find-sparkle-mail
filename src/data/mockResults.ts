import { EmailResult } from "@/types/emailFinder";

const firstNames = ["James", "Sarah", "Michael", "Emily", "David", "Jessica", "Robert", "Amanda", "Daniel", "Lauren", "Andrew", "Rachel", "Ryan", "Megan", "Kevin", "Stephanie", "Brian", "Nicole", "Jason", "Ashley", "Chris", "Samantha", "Matt", "Jennifer", "Alex"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Clark", "Lewis", "Walker", "Hall"];
const companies = ["TechFlow", "DataSync", "CloudPeak", "FinServe Pro", "GrowthLabs", "Nexus AI", "PulseMetrics", "AeroStack", "CodeVault", "StreamLine", "PayBridge", "MedTech360", "RetailOS", "InsureTech", "EduPlatform", "PropTech Hub", "LogiChain", "AgriSense", "LegalEase", "CyberShield"];
const domains = ["techflow.io", "datasync.com", "cloudpeak.co", "finservepro.com", "growthlabs.io", "nexusai.com", "pulsemetrics.io", "aerostack.dev", "codevault.io", "streamline.co", "paybridge.com", "medtech360.io", "retailos.com", "insuretech.co", "eduplatform.io", "proptech-hub.com", "logichain.io", "agrisense.co", "legalease.io", "cybershield.com"];
const titles = ["CEO", "CTO", "VP Sales", "Director of Marketing", "Engineering Manager", "Product Manager", "Sales Manager", "Loan Officer", "CFO", "VP Engineering", "Account Executive", "Data Scientist", "HR Director", "SDR", "CMO"];
const depts = ["Executive", "Engineering", "Sales", "Marketing", "Product", "Finance", "HR", "Operations", "Data Science", "Security"];
const seniorities = ["C-Suite", "VP", "Director", "Manager", "Individual Contributor"];
const locations = ["San Francisco, CA", "New York, NY", "Austin, TX", "London, UK", "Toronto, CA", "Berlin, DE", "Singapore", "Sydney, AU", "Seattle, WA", "Boston, MA"];
const industries = ["Technology/SaaS", "Finance/Banking", "Healthcare", "E-Commerce", "Education", "Real Estate", "Insurance", "Manufacturing"];
const sizes = ["11-50", "51-200", "201-500", "501-1000", "1001-5000"];

export function generateMockResults(count: number = 25): EmailResult[] {
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  return Array.from({ length: count }, (_, i) => {
    const fn = pick(firstNames);
    const ln = pick(lastNames);
    const cIdx = Math.floor(Math.random() * companies.length);
    const domain = domains[cIdx];
    const patterns = [`${fn.toLowerCase()}.${ln.toLowerCase()}`, `${fn[0].toLowerCase()}${ln.toLowerCase()}`, `${fn.toLowerCase()}`];
    const email = `${pick(patterns)}@${domain}`;

    const linkedinUrl = Math.random() > 0.33 ? `https://linkedin.com/in/${fn.toLowerCase()}-${ln.toLowerCase()}-${Math.floor(Math.random() * 900 + 100)}` : undefined;

    return {
      id: `res-${i}-${Math.random().toString(36).slice(2, 6)}`,
      firstName: fn,
      lastName: ln,
      email,
      title: pick(titles),
      company: companies[cIdx],
      domain,
      confidence: Math.floor(70 + Math.random() * 30),
      status: pick(["valid", "risky", "unknown"] as ("valid" | "risky" | "unknown")[]),
      department: pick(depts),
      seniority: pick(seniorities),
      location: pick(locations),
      industry: pick(industries),
      companySize: pick(sizes),
      linkedinUrl,
    };
  });
}
