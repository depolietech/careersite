type JobSuggestions = {
  skills: string[];
  certifications: string[];
  education: string;
};

const TAXONOMY: Array<{ patterns: string[]; suggestions: JobSuggestions }> = [
  {
    patterns: ["software engineer", "software developer", "swe", "full stack", "fullstack", "full-stack"],
    suggestions: {
      skills: ["JavaScript", "TypeScript", "React", "Node.js", "Git", "REST APIs", "SQL", "Docker"],
      certifications: ["AWS Certified Developer", "Google Cloud Professional", "Azure Developer Associate"],
      education: "bachelor",
    },
  },
  {
    patterns: ["frontend", "front-end", "front end", "ui developer", "react developer", "vue developer", "angular developer"],
    suggestions: {
      skills: ["JavaScript", "TypeScript", "React", "CSS", "HTML", "Tailwind CSS", "Git", "Figma"],
      certifications: ["Google UX Design Certificate", "AWS Certified Developer"],
      education: "bachelor",
    },
  },
  {
    patterns: ["backend", "back-end", "back end", "api developer", "server-side"],
    suggestions: {
      skills: ["Node.js", "Python", "PostgreSQL", "Docker", "REST APIs", "Redis", "Kubernetes", "Git"],
      certifications: ["AWS Solutions Architect", "Google Cloud Professional", "Certified Kubernetes Administrator"],
      education: "bachelor",
    },
  },
  {
    patterns: ["devops", "site reliability", "sre", "platform engineer", "infrastructure"],
    suggestions: {
      skills: ["Kubernetes", "Docker", "Terraform", "CI/CD", "Linux", "AWS", "Git", "Bash"],
      certifications: ["AWS DevOps Engineer", "Certified Kubernetes Administrator", "HashiCorp Terraform Associate", "Google Cloud DevOps Engineer"],
      education: "bachelor",
    },
  },
  {
    patterns: ["data scientist", "data science", "machine learning", "ml engineer", "ai engineer"],
    suggestions: {
      skills: ["Python", "Machine Learning", "TensorFlow", "PyTorch", "SQL", "Statistics", "Pandas", "Scikit-learn"],
      certifications: ["AWS Machine Learning Specialty", "Google Professional Data Engineer", "Databricks Certified ML Professional"],
      education: "master",
    },
  },
  {
    patterns: ["data analyst", "business analyst", "data analysis"],
    suggestions: {
      skills: ["SQL", "Python", "Excel", "Tableau", "Power BI", "Data Visualization", "Statistics"],
      certifications: ["Google Data Analytics Certificate", "Tableau Desktop Specialist", "Microsoft Power BI"],
      education: "bachelor",
    },
  },
  {
    patterns: ["data engineer", "etl", "big data"],
    suggestions: {
      skills: ["Python", "SQL", "Apache Spark", "Airflow", "Kafka", "dbt", "AWS", "Snowflake"],
      certifications: ["AWS Data Analytics Specialty", "Google Professional Data Engineer", "Databricks Certified Data Engineer"],
      education: "bachelor",
    },
  },
  {
    patterns: ["product manager", "product owner", "product lead"],
    suggestions: {
      skills: ["Product Strategy", "Agile", "User Research", "Roadmapping", "SQL", "A/B Testing", "JIRA"],
      certifications: ["Certified Scrum Product Owner", "Product Management Certificate", "PMP"],
      education: "bachelor",
    },
  },
  {
    patterns: ["project manager", "program manager", "project lead"],
    suggestions: {
      skills: ["Agile", "Scrum", "Risk Management", "JIRA", "Stakeholder Management", "Budgeting", "MS Project"],
      certifications: ["PMP", "Certified ScrumMaster", "PRINCE2", "PMI-ACP"],
      education: "bachelor",
    },
  },
  {
    patterns: ["ux designer", "ui designer", "ux/ui", "product designer", "interaction designer"],
    suggestions: {
      skills: ["Figma", "User Research", "Wireframing", "Prototyping", "Usability Testing", "Design Systems", "Adobe XD"],
      certifications: ["Google UX Design Certificate", "Nielsen Norman UX Certification", "Interaction Design Foundation"],
      education: "bachelor",
    },
  },
  {
    patterns: ["graphic designer", "visual designer", "brand designer"],
    suggestions: {
      skills: ["Adobe Illustrator", "Adobe Photoshop", "InDesign", "Figma", "Typography", "Brand Identity"],
      certifications: ["Adobe Certified Professional"],
      education: "college",
    },
  },
  {
    patterns: ["security engineer", "cybersecurity", "infosec", "information security", "penetration tester", "pentester"],
    suggestions: {
      skills: ["Network Security", "SIEM", "Vulnerability Assessment", "Python", "Linux", "Incident Response", "Firewalls"],
      certifications: ["CISSP", "CEH", "CompTIA Security+", "OSCP", "CISM"],
      education: "bachelor",
    },
  },
  {
    patterns: ["marketing manager", "digital marketing", "marketing specialist", "growth marketer"],
    suggestions: {
      skills: ["SEO", "Google Analytics", "Content Marketing", "Social Media", "Email Marketing", "CRM", "A/B Testing"],
      certifications: ["Google Ads Certification", "HubSpot Marketing Certification", "Facebook Blueprint"],
      education: "bachelor",
    },
  },
  {
    patterns: ["sales", "account executive", "business development", "account manager"],
    suggestions: {
      skills: ["CRM", "Salesforce", "Negotiation", "Pipeline Management", "Cold Outreach", "Presentation Skills"],
      certifications: ["Salesforce Certified Administrator", "HubSpot Sales Certification"],
      education: "bachelor",
    },
  },
  {
    patterns: ["hr", "human resources", "recruiter", "talent acquisition", "people operations"],
    suggestions: {
      skills: ["HRIS", "Talent Acquisition", "Employee Relations", "Compliance", "Performance Management", "ATS"],
      certifications: ["SHRM-CP", "PHR", "CHRP"],
      education: "bachelor",
    },
  },
  {
    patterns: ["accountant", "accounting", "bookkeeper", "controller", "cpa", "finance analyst", "financial analyst"],
    suggestions: {
      skills: ["Excel", "QuickBooks", "GAAP", "Financial Reporting", "Accounts Payable", "Accounts Receivable", "Tax"],
      certifications: ["CPA", "CGA", "CFA", "QuickBooks Certification"],
      education: "bachelor",
    },
  },
  {
    patterns: ["nurse", "nursing", "registered nurse", "rn", "lpn", "clinical nurse"],
    suggestions: {
      skills: ["Patient Care", "Clinical Assessment", "Electronic Health Records", "IV Therapy", "Wound Care", "BLS"],
      certifications: ["RN License", "BLS Certification", "ACLS", "PALS"],
      education: "college",
    },
  },
  {
    patterns: ["teacher", "educator", "instructor", "professor", "tutor"],
    suggestions: {
      skills: ["Curriculum Development", "Lesson Planning", "Classroom Management", "Assessment", "Communication"],
      certifications: ["Teaching Certificate", "Provincial Teaching License"],
      education: "bachelor",
    },
  },
  {
    patterns: ["customer service", "customer support", "support specialist", "help desk"],
    suggestions: {
      skills: ["Communication", "CRM", "Problem Solving", "Zendesk", "Conflict Resolution", "Ticketing Systems"],
      certifications: ["HDI Customer Service Representative", "Salesforce Service Cloud"],
      education: "",
    },
  },
  {
    patterns: ["mobile developer", "ios developer", "android developer", "react native", "flutter developer"],
    suggestions: {
      skills: ["Swift", "Kotlin", "React Native", "Flutter", "REST APIs", "Git", "Xcode", "Android Studio"],
      certifications: ["Google Associate Android Developer", "Apple Swift Certification"],
      education: "bachelor",
    },
  },
  {
    patterns: ["qa engineer", "quality assurance", "test engineer", "software tester", "qa analyst"],
    suggestions: {
      skills: ["Test Automation", "Selenium", "Cypress", "JIRA", "API Testing", "Regression Testing", "SQL"],
      certifications: ["ISTQB Foundation", "Certified Software Tester", "AWS Certified Developer"],
      education: "bachelor",
    },
  },
  {
    patterns: ["cloud architect", "solutions architect", "cloud engineer"],
    suggestions: {
      skills: ["AWS", "Azure", "Google Cloud", "Kubernetes", "Terraform", "Networking", "Security", "Docker"],
      certifications: ["AWS Solutions Architect Professional", "Google Cloud Professional Architect", "Azure Solutions Architect"],
      education: "bachelor",
    },
  },
  {
    patterns: ["scrum master", "agile coach", "delivery manager"],
    suggestions: {
      skills: ["Scrum", "Agile", "Kanban", "JIRA", "Facilitation", "Coaching", "Sprint Planning"],
      certifications: ["Certified ScrumMaster", "SAFe Scrum Master", "PMI-ACP"],
      education: "bachelor",
    },
  },
  {
    patterns: ["content writer", "copywriter", "technical writer", "content creator"],
    suggestions: {
      skills: ["SEO Writing", "Content Strategy", "Editing", "Research", "CMS", "WordPress", "AP Style"],
      certifications: ["Google Analytics Certification", "HubSpot Content Marketing"],
      education: "bachelor",
    },
  },
  {
    patterns: ["pharmacist", "pharmacy"],
    suggestions: {
      skills: ["Drug Therapy Management", "Patient Counseling", "Prescription Verification", "Compounding", "EHR"],
      certifications: ["Pharmacist License", "PharmD"],
      education: "phd",
    },
  },
  {
    patterns: ["lawyer", "attorney", "legal counsel", "paralegal", "legal assistant"],
    suggestions: {
      skills: ["Legal Research", "Contract Drafting", "Litigation", "Negotiation", "Document Review", "Westlaw"],
      certifications: ["Bar Admission", "Paralegal Certificate"],
      education: "master",
    },
  },
];

export function getJobSuggestions(title: string): JobSuggestions | null {
  if (!title || title.trim().length < 3) return null;
  const lower = title.toLowerCase().trim();
  for (const entry of TAXONOMY) {
    if (entry.patterns.some((p) => lower.includes(p))) {
      return entry.suggestions;
    }
  }
  return null;
}
