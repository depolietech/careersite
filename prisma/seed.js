// npx prisma db seed  ←  run this to populate the database
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();
const HASH       = bcrypt.hashSync("demo1234", 12);
const ADMIN_HASH = bcrypt.hashSync("Admin@Equalhires2024!", 12);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const skills = (...s) => JSON.stringify(s);
const future = (days) => new Date(Date.now() + days * 864e5);
const past   = (days) => new Date(Date.now() - days * 864e5);

async function main() {
  console.log("🗑  Wiping existing data…");
  await db.message.deleteMany();
  await db.conversation.deleteMany();
  await db.interview.deleteMany();
  await db.application.deleteMany();
  await db.workExperience.deleteMany();
  await db.education.deleteMany();
  await db.jobSeekerProfile.deleteMany();
  await db.job.deleteMany();
  await db.employerProfile.deleteMany();
  await db.contractorProfile.deleteMany();
  await db.verificationToken.deleteMany();
  await db.user.deleteMany();

  // ════════════════════════════════════════════════════════════════════════════
  // ADMIN
  // ════════════════════════════════════════════════════════════════════════════
  console.log("🔑 Creating admin account…");
  await db.user.create({ data: {
    email: "admin@equalhires.com",
    passwordHash: ADMIN_HASH,
    role: "ADMIN",
    emailVerified: new Date(),
  }});

  // ════════════════════════════════════════════════════════════════════════════
  // EMPLOYERS
  // ════════════════════════════════════════════════════════════════════════════
  console.log("🏢 Creating employers…");

  const [r1, r2, r3, r4, r5, r6, r7, r8] = await Promise.all([

    // 1 — TechHire Solutions (agency, active — primary demo account)
    db.user.create({ data: {
      email: "recruiter.active@demo.com", passwordHash: HASH,
      role: "EMPLOYER", recruiterType: "AGENCY", emailVerified: new Date(),
      employerProfile: { create: {
        companyName: "TechHire Solutions", companySize: "11-50",
        industry: "Staffing & Recruiting", website: "https://techhire.demo",
        description: "We connect elite tech talent with forward-thinking companies across North America.",
        location: "Toronto, ON, Canada",
        interviewsScheduled: 24, interviewsCancelled: 2, trustScore: 96,
      }},
    }, include: { employerProfile: true } }),

    // 2 — Bright Futures Staffing (company, new)
    db.user.create({ data: {
      email: "recruiter.new@demo.com", passwordHash: HASH,
      role: "EMPLOYER", recruiterType: "COMPANY", emailVerified: new Date(),
      employerProfile: { create: {
        companyName: "Bright Futures Staffing", companySize: "1-10",
        industry: "Staffing & Recruiting", location: "Chicago, IL, USA",
        interviewsScheduled: 0, trustScore: 100,
      }},
    }, include: { employerProfile: true } }),

    // 3 — TechCorp Africa (company, large)
    db.user.create({ data: {
      email: "techcorp@demo.com", passwordHash: HASH,
      role: "EMPLOYER", recruiterType: "COMPANY", emailVerified: new Date(),
      employerProfile: { create: {
        companyName: "TechCorp Americas", companySize: "201-1000",
        industry: "Software / SaaS", website: "https://techcorp.demo",
        description: "Leading SaaS company building the next generation of fintech infrastructure.",
        location: "New York, NY, USA",
        interviewsScheduled: 18, interviewsCancelled: 1, trustScore: 98,
      }},
    }, include: { employerProfile: true } }),

    // 4 — FinServe Innovation (company, medium)
    db.user.create({ data: {
      email: "fintech@demo.com", passwordHash: HASH,
      role: "EMPLOYER", recruiterType: "COMPANY", emailVerified: new Date(),
      employerProfile: { create: {
        companyName: "FinServe Innovation", companySize: "51-200",
        industry: "Fintech", website: "https://finserve.demo",
        description: "Building next-gen payment rails and lending infrastructure for North American markets.",
        location: "San Francisco, CA, USA",
        interviewsScheduled: 12, interviewsCancelled: 0, trustScore: 100,
      }},
    }, include: { employerProfile: true } }),

    // 5 — HealthFirst Tech (company, medium)
    db.user.create({ data: {
      email: "healthtech@demo.com", passwordHash: HASH,
      role: "EMPLOYER", recruiterType: "COMPANY", emailVerified: new Date(),
      employerProfile: { create: {
        companyName: "HealthFirst Tech", companySize: "51-200",
        industry: "HealthTech", website: "https://healthfirst.demo",
        description: "Digital health platform connecting patients and providers across North America.",
        location: "Seattle, WA, USA",
        interviewsScheduled: 9, interviewsCancelled: 1, trustScore: 95,
      }},
    }, include: { employerProfile: true } }),

    // 6 — StartupX (company, small — early-stage)
    db.user.create({ data: {
      email: "startupx@demo.com", passwordHash: HASH,
      role: "EMPLOYER", recruiterType: "COMPANY", emailVerified: new Date(),
      employerProfile: { create: {
        companyName: "StartupX", companySize: "1-10",
        industry: "E-Commerce", website: "https://startupx.demo",
        description: "Early-stage B2C marketplace disrupting local retail across North America.",
        location: "Austin, TX, USA",
        interviewsScheduled: 3, interviewsCancelled: 0, trustScore: 100,
      }},
    }, include: { employerProfile: true } }),

    // 7 — TalentBridge Agency (agency)
    db.user.create({ data: {
      email: "agency@demo.com", passwordHash: HASH,
      role: "EMPLOYER", recruiterType: "AGENCY", emailVerified: new Date(),
      employerProfile: { create: {
        companyName: "TalentBridge Agency", companySize: "11-50",
        industry: "Staffing & Recruiting",
        description: "Specialist tech recruiters placing senior engineers at top-tier companies across North America.",
        location: "Vancouver, BC, Canada",
        interviewsScheduled: 31, interviewsCancelled: 3, trustScore: 91,
      }},
    }, include: { employerProfile: true } }),

    // 8 — QuickHire (low trust — high cancellation rate)
    db.user.create({ data: {
      email: "lowtrust@demo.com", passwordHash: HASH,
      role: "EMPLOYER", recruiterType: "COMPANY", emailVerified: new Date(),
      employerProfile: { create: {
        companyName: "QuickHire Ltd", companySize: "1-10",
        industry: "Staffing & Recruiting", location: "Remote",
        interviewsScheduled: 10, interviewsCancelled: 8, trustScore: 45,
      }},
    }, include: { employerProfile: true } }),
  ]);

  // ════════════════════════════════════════════════════════════════════════════
  // JOBS (25 listings across all companies)
  // ════════════════════════════════════════════════════════════════════════════
  console.log("💼 Creating jobs…");

  const jobs = await Promise.all([

    // ── TechHire Solutions (r1) ──────────────────────────────────────────────
    db.job.create({ data: {
      title: "Senior Frontend Engineer", status: "ACTIVE",
      location: "Remote", jobType: "full-time",
      salaryMin: 80000, salaryMax: 110000, experience: 5,
      skills: skills("React", "TypeScript", "CSS", "GraphQL", "Figma"),
      description: "Own the front-end architecture for a fast-growing SaaS platform. You'll mentor junior engineers, set coding standards, and ship polished React UIs.\n\nResponsibilities:\n- Architect scalable component libraries\n- Drive Figma-to-code handoffs with designers\n- Lead performance and accessibility improvements\n- Conduct code reviews",
      postedById: r1.id, employerProfileId: r1.employerProfile.id,
    }}),

    db.job.create({ data: {
      title: "Backend Engineer – Node.js", status: "ACTIVE",
      location: "Toronto, ON, Canada", jobType: "full-time",
      salaryMin: 70000, salaryMax: 100000, experience: 3,
      skills: skills("Node.js", "PostgreSQL", "Docker", "AWS", "TypeScript"),
      description: "Build robust REST and GraphQL APIs for a high-traffic platform. You'll own database design, API contracts, and CI/CD pipelines.\n\nYou will:\n- Design and implement APIs used by 100k+ users\n- Optimise PostgreSQL queries and indexing\n- Set up and maintain Docker and AWS infrastructure\n- Write comprehensive unit and integration tests",
      postedById: r1.id, employerProfileId: r1.employerProfile.id,
    }}),

    db.job.create({ data: {
      title: "Product Designer", status: "PAUSED",
      location: "Remote", jobType: "full-time",
      salaryMin: 65000, salaryMax: 90000, experience: 4,
      skills: skills("Figma", "User Research", "Prototyping", "Design Systems", "Usability Testing"),
      description: "Shape the end-to-end product experience for a B2B SaaS product. From discovery to final handoffs.",
      postedById: r1.id, employerProfileId: r1.employerProfile.id,
    }}),

    // ── TechCorp Africa (r3) ─────────────────────────────────────────────────
    db.job.create({ data: {
      title: "Full-Stack Developer", status: "ACTIVE",
      location: "New York, NY, USA", jobType: "full-time",
      salaryMin: 60000, salaryMax: 85000, experience: 3,
      skills: skills("React", "Node.js", "MongoDB", "TypeScript", "Redis"),
      description: "Join our core product team building mission-critical fintech infrastructure. You'll contribute across the full stack from API to UI.\n\nWhat you'll do:\n- Build new product features end-to-end\n- Collaborate on API design and database modelling\n- Write tests and participate in code reviews\n- Own features from design through deployment",
      postedById: r3.id, employerProfileId: r3.employerProfile.id,
    }}),

    db.job.create({ data: {
      title: "React Native Developer", status: "ACTIVE",
      location: "Toronto, ON, Canada", jobType: "full-time",
      salaryMin: 55000, salaryMax: 80000, experience: 3,
      skills: skills("React Native", "TypeScript", "iOS", "Android", "Firebase"),
      description: "Build our consumer-facing mobile apps for iOS and Android. You will work closely with the design team to deliver pixel-perfect, performant mobile experiences.",
      postedById: r3.id, employerProfileId: r3.employerProfile.id,
    }}),

    db.job.create({ data: {
      title: "Data Engineer", status: "ACTIVE",
      location: "Remote", jobType: "full-time",
      salaryMin: 75000, salaryMax: 105000, experience: 4,
      skills: skills("Python", "Apache Spark", "dbt", "BigQuery", "Airflow"),
      description: "Design and maintain our data pipelines, warehouses, and transformation layers to power analytics and ML workloads.",
      postedById: r3.id, employerProfileId: r3.employerProfile.id,
    }}),

    // ── FinServe Innovation (r4) ─────────────────────────────────────────────
    db.job.create({ data: {
      title: "Machine Learning Engineer", status: "ACTIVE",
      location: "New York, NY, USA", jobType: "full-time",
      salaryMin: 90000, salaryMax: 130000, experience: 4,
      skills: skills("Python", "TensorFlow", "PyTorch", "MLflow", "AWS SageMaker"),
      description: "Build and productionise ML models for credit scoring, fraud detection, and personalisation at scale. Collaborate with data scientists and engineers to take models from experiment to production.",
      postedById: r4.id, employerProfileId: r4.employerProfile.id,
    }}),

    db.job.create({ data: {
      title: "Backend Python Developer", status: "ACTIVE",
      location: "New York, NY, USA", jobType: "full-time",
      salaryMin: 80000, salaryMax: 110000, experience: 3,
      skills: skills("Python", "Django", "PostgreSQL", "Celery", "Redis", "Docker"),
      description: "Join our platform team building the core payment and lending APIs. High-throughput systems serving millions of transactions daily.",
      postedById: r4.id, employerProfileId: r4.employerProfile.id,
    }}),

    db.job.create({ data: {
      title: "Security Engineer", status: "ACTIVE",
      location: "New York, NY, USA", jobType: "full-time",
      salaryMin: 95000, salaryMax: 135000, experience: 5,
      skills: skills("Penetration Testing", "OWASP", "AWS Security", "SIEM", "Compliance"),
      description: "Own our security posture across infrastructure, applications, and processes. Conduct penetration tests, implement threat detection, and advise engineering teams on secure coding.",
      postedById: r4.id, employerProfileId: r4.employerProfile.id,
    }}),

    // ── HealthFirst Tech (r5) ────────────────────────────────────────────────
    db.job.create({ data: {
      title: "Full-Stack Engineer – HealthTech", status: "ACTIVE",
      location: "Seattle, WA, USA", jobType: "full-time",
      salaryMin: 45000, salaryMax: 65000, experience: 3,
      skills: skills("React", "Django", "PostgreSQL", "AWS", "FHIR"),
      description: "Build life-changing health applications connecting patients and clinicians. Work on EHR integrations, telemedicine features, and patient portals.",
      postedById: r5.id, employerProfileId: r5.employerProfile.id,
    }}),

    db.job.create({ data: {
      title: "UX/UI Designer – Digital Health", status: "ACTIVE",
      location: "Remote", jobType: "full-time",
      salaryMin: 40000, salaryMax: 60000, experience: 3,
      skills: skills("Figma", "User Research", "Accessibility", "Prototyping", "Design Systems"),
      description: "Design clear, accessible, and empathetic interfaces for patients and healthcare workers in low-bandwidth environments.",
      postedById: r5.id, employerProfileId: r5.employerProfile.id,
    }}),

    db.job.create({ data: {
      title: "Product Manager – Patient Experience", status: "ACTIVE",
      location: "Seattle, WA, USA", jobType: "full-time",
      salaryMin: 55000, salaryMax: 75000, experience: 4,
      skills: skills("Product Strategy", "Roadmapping", "Data Analysis", "Agile", "Healthcare"),
      description: "Own the patient-facing product roadmap. Work with clinicians, engineers, and designers to identify problems and ship solutions that improve health outcomes.",
      postedById: r5.id, employerProfileId: r5.employerProfile.id,
    }}),

    // ── StartupX (r6) ────────────────────────────────────────────────────────
    db.job.create({ data: {
      title: "Full-Stack Developer (Founding Team)", status: "ACTIVE",
      location: "Austin, TX, USA", jobType: "full-time",
      salaryMin: 35000, salaryMax: 55000, experience: 2,
      skills: skills("React", "Node.js", "PostgreSQL", "TypeScript", "Stripe"),
      description: "Join our 5-person founding team and own everything from API to checkout. Expect high ownership, fast pace, and meaningful equity.\n\nYou'll be the 2nd engineer — your architecture decisions will shape the product for years.",
      postedById: r6.id, employerProfileId: r6.employerProfile.id,
    }}),

    db.job.create({ data: {
      title: "Growth & Marketing Lead", status: "ACTIVE",
      location: "Austin, TX, USA", jobType: "full-time",
      salaryMin: 30000, salaryMax: 50000, experience: 2,
      skills: skills("SEO", "Content Marketing", "Social Media", "Analytics", "Copywriting"),
      description: "Drive user acquisition and retention for our marketplace. Own our social channels, SEO strategy, paid campaigns, and content calendar.",
      postedById: r6.id, employerProfileId: r6.employerProfile.id,
    }}),

    // ── TalentBridge Agency (r7) ─────────────────────────────────────────────
    db.job.create({ data: {
      title: "Senior Java Developer", status: "ACTIVE",
      location: "Vancouver, BC, Canada", jobType: "full-time",
      salaryMin: 90000, salaryMax: 120000, experience: 6,
      skills: skills("Java", "Spring Boot", "Microservices", "Kafka", "PostgreSQL"),
      description: "Exciting opportunity with a leading European enterprise software company. You'll build high-scale microservices handling 10M+ daily events.",
      postedById: r7.id, employerProfileId: r7.employerProfile.id,
    }}),

    db.job.create({ data: {
      title: "Cloud DevOps Engineer", status: "ACTIVE",
      location: "Remote", jobType: "full-time",
      salaryMin: 85000, salaryMax: 115000, experience: 4,
      skills: skills("AWS", "Kubernetes", "Terraform", "CI/CD", "Monitoring"),
      description: "Own the infrastructure and deployment pipelines for a distributed SaaS platform. You'll implement IaC, improve observability, and champion reliability.",
      postedById: r7.id, employerProfileId: r7.employerProfile.id,
    }}),

    db.job.create({ data: {
      title: "iOS Developer – Swift", status: "ACTIVE",
      location: "Remote", jobType: "contract",
      salaryMin: 70000, salaryMax: 95000, experience: 3,
      skills: skills("Swift", "SwiftUI", "Xcode", "Core Data", "REST APIs"),
      description: "6-month contract (renewable) to build a new iOS app for a European logistics company. Solo developer role — you'll own the architecture and delivery.",
      postedById: r7.id, employerProfileId: r7.employerProfile.id,
    }}),

    // ── QuickHire (r8) — lower quality listing ───────────────────────────────
    db.job.create({ data: {
      title: "Software Developer", status: "ACTIVE",
      location: "Remote", jobType: "full-time",
      salaryMin: 30000, salaryMax: 80000, experience: 1,
      skills: skills("JavaScript", "Python", "React", "Any"),
      description: "We need a developer urgently. Must be available immediately. Flexible on stack. Good pay. Contact us for more details.",
      postedById: r8.id, employerProfileId: r8.employerProfile.id,
    }}),

    // ── Extra jobs for realism (posted by r1, r3) ────────────────────────────
    db.job.create({ data: {
      title: "Android Developer – Kotlin", status: "ACTIVE",
      location: "Toronto, ON, Canada", jobType: "full-time",
      salaryMin: 50000, salaryMax: 75000, experience: 3,
      skills: skills("Kotlin", "Android", "Jetpack Compose", "Firebase", "REST APIs"),
      description: "Build and maintain our Android application serving 200k+ users. Work closely with backend engineers and product designers.",
      postedById: r3.id, employerProfileId: r3.employerProfile.id,
    }}),

    db.job.create({ data: {
      title: "QA Engineer – Automation", status: "ACTIVE",
      location: "Remote", jobType: "full-time",
      salaryMin: 45000, salaryMax: 65000, experience: 3,
      skills: skills("Playwright", "Cypress", "Jest", "CI/CD", "TypeScript"),
      description: "Own our automated testing strategy across web and API layers. Raise confidence in every release.",
      postedById: r1.id, employerProfileId: r1.employerProfile.id,
    }}),

    db.job.create({ data: {
      title: "Technical Writer", status: "ACTIVE",
      location: "Remote", jobType: "part-time",
      salaryMin: 30000, salaryMax: 50000, experience: 2,
      skills: skills("Technical Writing", "Markdown", "API Documentation", "Developer Experience"),
      description: "Create developer documentation, API guides, and tutorials for our platform. Work closely with engineering to ship content that actually helps developers succeed.",
      postedById: r4.id, employerProfileId: r4.employerProfile.id,
    }}),

    db.job.create({ data: {
      title: "Scrum Master / Agile Coach", status: "ACTIVE",
      location: "New York, NY, USA", jobType: "full-time",
      salaryMin: 70000, salaryMax: 90000, experience: 4,
      skills: skills("Agile", "Scrum", "Jira", "Team Facilitation", "Stakeholder Management"),
      description: "Facilitate 3 cross-functional engineering teams delivering high-impact fintech features. Coach teams on continuous improvement.",
      postedById: r4.id, employerProfileId: r4.employerProfile.id,
    }}),

    db.job.create({ data: {
      title: "Frontend Developer – Vue.js", status: "ACTIVE",
      location: "Vancouver, BC, Canada", jobType: "full-time",
      salaryMin: 65000, salaryMax: 90000, experience: 3,
      skills: skills("Vue.js", "TypeScript", "Pinia", "Nuxt", "TailwindCSS"),
      description: "Join a small product team building a B2B SaaS dashboard. Own the frontend, contribute to product direction, and ship with high craft.",
      postedById: r7.id, employerProfileId: r7.employerProfile.id,
    }}),

    db.job.create({ data: {
      title: "Data Analyst – Business Intelligence", status: "ACTIVE",
      location: "Seattle, WA, USA", jobType: "full-time",
      salaryMin: 35000, salaryMax: 55000, experience: 2,
      skills: skills("SQL", "Tableau", "Python", "Google Sheets", "dbt"),
      description: "Transform raw data into insights that drive business decisions. Build dashboards, run ad-hoc analyses, and work closely with product and ops teams.",
      postedById: r5.id, employerProfileId: r5.employerProfile.id,
    }}),

    db.job.create({ data: {
      title: "DevOps / Platform Engineer", status: "ACTIVE",
      location: "Remote", jobType: "full-time",
      salaryMin: 80000, salaryMax: 110000, experience: 4,
      skills: skills("Kubernetes", "Terraform", "GCP", "GitHub Actions", "Prometheus"),
      description: "Build and scale our internal developer platform. Improve CI/CD pipelines, observability, and infrastructure reliability for 20+ engineers.",
      postedById: r3.id, employerProfileId: r3.employerProfile.id,
    }}),
  ]);

  // ════════════════════════════════════════════════════════════════════════════
  // JOB SEEKERS (30 profiles)
  // ════════════════════════════════════════════════════════════════════════════
  console.log("👥 Creating job seekers…");

  // Pre-build them all for easy referencing
  const seekerData = [

    // 1 ── Jordan Rivera (primary demo — full stack, 6yr)
    { email: "seeker.active@demo.com", firstName: "Jordan", lastName: "Rivera",
      headline: "Full-Stack Developer | 6 yrs React & Node.js",
      summary: "Passionate full-stack engineer with 6 years of experience building SaaS products from 0 to 1. I thrive in cross-functional teams and love solving complex UI problems.",
      skills: skills("React","TypeScript","Node.js","PostgreSQL","Docker","AWS","GraphQL","Tailwind CSS"),
      yearsExperience: 6, jobType: "full-time", location: "Remote",
      salaryMin: 100000, salaryMax: 140000,
      experiences: [
        { title: "Senior Software Engineer", company: "CloudBase Inc.", startDate: "2022-03", current: true,
          description: "Led front-end architecture for a B2B SaaS platform serving 50k+ users. Cut design-dev cycle by 40% via component library.",
          skills: skills("React","TypeScript","GraphQL","AWS") },
        { title: "Software Engineer", company: "Stackify Labs", startDate: "2019-06", endDate: "2022-02",
          description: "Built 3 core product features. Reduced API response time 35% through query optimisation and caching.",
          skills: skills("Node.js","PostgreSQL","React","Docker") },
        { title: "Junior Developer", company: "Digital Sprout Agency", startDate: "2018-01", endDate: "2019-05",
          description: "Client websites and internal tooling. First professional exposure to React and REST APIs.",
          skills: skills("JavaScript","React","CSS","REST") },
      ],
      educations: [{ degree: "B.Sc. Computer Science", field: "Computer Science", institution: "University of Texas at Austin", startYear: 2014, endYear: 2018 }],
    },

    // 2 ── Casey Okafor (new account — minimal)
    { email: "seeker.new@demo.com", firstName: "Casey", lastName: "Okafor",
      headline: null, summary: null,
      skills: skills(), yearsExperience: null, jobType: null, location: null,
      salaryMin: null, salaryMax: null, experiences: [], educations: [],
    },

    // 3 ── Amara Obi (React dev, 4yr)
    { email: "amara@demo.com", firstName: "Amara", lastName: "Obi",
      headline: "Frontend Engineer | React & TypeScript Specialist",
      summary: "Detail-obsessed frontend engineer who loves crafting performant, accessible UIs. Open-source contributor with a design sensibility.",
      skills: skills("React","TypeScript","Next.js","TailwindCSS","Jest","Figma"),
      yearsExperience: 4, jobType: "full-time", location: "Toronto, ON, Canada",
      salaryMin: 55000, salaryMax: 80000,
      experiences: [
        { title: "Frontend Engineer", company: "PayStack (contract)", startDate: "2023-01", current: true,
          description: "Built and maintained the merchant dashboard used by 40k+ businesses.",
          skills: skills("React","TypeScript","TailwindCSS") },
        { title: "Junior Frontend Developer", company: "Interswitch", startDate: "2020-06", endDate: "2022-12",
          description: "Developed internal tools and consumer-facing web features.",
          skills: skills("React","JavaScript","CSS") },
      ],
      educations: [{ degree: "B.Sc. Computer Science", field: "Computer Science", institution: "University of Lagos", startYear: 2016, endYear: 2020 }],
    },

    // 4 ── James Chen (Data Scientist, 5yr)
    { email: "james@demo.com", firstName: "James", lastName: "Chen",
      headline: "Data Scientist | ML & Predictive Analytics",
      summary: "Data scientist with 5 years building predictive models in finance and e-commerce. Comfortable taking an idea from raw data to deployed API.",
      skills: skills("Python","TensorFlow","Scikit-learn","SQL","Tableau","AWS SageMaker"),
      yearsExperience: 5, jobType: "full-time", location: "San Francisco, CA, USA",
      salaryMin: 110000, salaryMax: 150000,
      experiences: [
        { title: "Data Scientist", company: "Stripe", startDate: "2021-04", current: true,
          description: "Built fraud detection models reducing chargeback rate by 22%. Owned feature engineering pipelines in PySpark.",
          skills: skills("Python","PySpark","Scikit-learn") },
        { title: "Analyst", company: "Accenture", startDate: "2019-08", endDate: "2021-03",
          description: "Data analysis and BI dashboards for Fortune 500 clients.",
          skills: skills("SQL","Tableau","Excel") },
      ],
      educations: [{ degree: "M.Sc. Statistics", field: "Machine Learning", institution: "Stanford University", startYear: 2017, endYear: 2019 }],
    },

    // 5 ── Priya Sharma (UX Designer, 3yr)
    { email: "priya@demo.com", firstName: "Priya", lastName: "Sharma",
      headline: "UX/UI Designer | Product Design & Research",
      summary: "Empathy-driven designer with 3 years crafting accessible, conversion-focused product experiences for mobile and web.",
      skills: skills("Figma","User Research","Usability Testing","Prototyping","Design Systems","Accessibility"),
      yearsExperience: 3, jobType: "full-time", location: "Los Angeles, CA, USA",
      salaryMin: 45000, salaryMax: 65000,
      experiences: [
        { title: "Product Designer", company: "Razorpay", startDate: "2022-06", current: true,
          description: "Designed checkout flows and merchant dashboard, improving conversion rate by 15%.",
          skills: skills("Figma","User Research","Prototyping") },
        { title: "UX Designer", company: "Infosys (BPO)", startDate: "2021-01", endDate: "2022-05",
          description: "UX redesign for internal enterprise tools serving 5k+ employees.",
          skills: skills("Figma","Wireframing","Accessibility") },
      ],
      educations: [{ degree: "B.Des. Interaction Design", field: "HCI", institution: "NID Ahmedabad", startYear: 2017, endYear: 2021 }],
    },

    // 6 ── Marcus Johnson (DevOps, 7yr)
    { email: "marcus@demo.com", firstName: "Marcus", lastName: "Johnson",
      headline: "Senior DevOps / Platform Engineer | AWS & Kubernetes",
      summary: "Infrastructure engineer who treats reliability as a feature. 7 years building and scaling cloud platforms for high-growth startups.",
      skills: skills("AWS","Kubernetes","Terraform","Docker","CI/CD","Prometheus","Grafana"),
      yearsExperience: 7, jobType: "full-time", location: "Remote",
      salaryMin: 120000, salaryMax: 160000,
      experiences: [
        { title: "Senior DevOps Engineer", company: "Datadog", startDate: "2020-09", current: true,
          description: "Built internal developer platform serving 300+ engineers. Reduced deploy time by 60%.",
          skills: skills("Kubernetes","Terraform","AWS") },
        { title: "Cloud Engineer", company: "Heroku", startDate: "2017-03", endDate: "2020-08",
          description: "Maintained cloud infrastructure and on-call rotation for critical customer environments.",
          skills: skills("AWS","Docker","Linux") },
      ],
      educations: [{ degree: "B.Sc. Systems Engineering", field: "Cloud Computing", institution: "Georgia Tech", startYear: 2013, endYear: 2017 }],
    },

    // 7 ── Sofia Rossi (Product Manager, 5yr)
    { email: "sofia@demo.com", firstName: "Sofia", lastName: "Rossi",
      headline: "Product Manager | B2B SaaS & Fintech",
      summary: "Product leader with a track record of shipping 0-to-1 features in fintech and B2B SaaS. Data-informed, customer-obsessed.",
      skills: skills("Product Strategy","Roadmapping","SQL","A/B Testing","Agile","Jira","Figma"),
      yearsExperience: 5, jobType: "full-time", location: "New York, NY, USA",
      salaryMin: 80000, salaryMax: 110000,
      experiences: [
        { title: "Senior Product Manager", company: "Monzo", startDate: "2021-07", current: true,
          description: "Owned the loans product roadmap. Shipped 4 major features increasing loan uptake by 30%.",
          skills: skills("Product Strategy","SQL","A/B Testing") },
        { title: "Product Manager", company: "Funding Circle", startDate: "2019-03", endDate: "2021-06",
          description: "Drove SMB onboarding improvements reducing time-to-fund by 40%.",
          skills: skills("Roadmapping","Agile","Jira") },
      ],
      educations: [{ degree: "MBA", field: "Strategy & Innovation", institution: "London Business School", startYear: 2017, endYear: 2019 }],
    },

    // 8 ── Kwame Asante (Backend Python, 3yr)
    { email: "kwame@demo.com", firstName: "Kwame", lastName: "Asante",
      headline: "Backend Python Engineer | Django & FastAPI",
      summary: "Backend engineer specialising in high-performance Python APIs and async systems. Contributor to open-source Django packages.",
      skills: skills("Python","Django","FastAPI","PostgreSQL","Redis","Celery","Docker"),
      yearsExperience: 3, jobType: "full-time", location: "Austin, TX, USA",
      salaryMin: 40000, salaryMax: 60000,
      experiences: [
        { title: "Backend Engineer", company: "Hubtel", startDate: "2022-01", current: true,
          description: "Built and maintained payment processing APIs handling $2M+ daily volume.",
          skills: skills("Python","Django","PostgreSQL","Redis") },
        { title: "Junior Developer", company: "Innohub", startDate: "2021-03", endDate: "2021-12",
          description: "Developed REST APIs for a logistics startup's mobile app.",
          skills: skills("Python","Flask","MySQL") },
      ],
      educations: [{ degree: "B.Sc. Computer Engineering", field: "Software Systems", institution: "KNUST", startYear: 2017, endYear: 2021 }],
    },

    // 9 ── Emma Williams (Content Writer, 2yr)
    { email: "emma@demo.com", firstName: "Emma", lastName: "Williams",
      headline: "Technical Content Writer | Developer Documentation",
      summary: "Former software developer turned technical writer. I translate complex engineering concepts into clear, developer-friendly documentation.",
      skills: skills("Technical Writing","API Documentation","Markdown","SEO","Developer Experience","Git"),
      yearsExperience: 2, jobType: "part-time", location: "Remote",
      salaryMin: 40000, salaryMax: 55000,
      experiences: [
        { title: "Technical Writer", company: "Postman", startDate: "2023-02", current: true,
          description: "Wrote API guides, tutorials, and release notes for 20M+ developer users.",
          skills: skills("Technical Writing","API Documentation","Markdown") },
        { title: "Junior Developer", company: "ThoughtWorks", startDate: "2022-01", endDate: "2023-01",
          description: "Frontend development before transitioning to technical writing.",
          skills: skills("React","JavaScript") },
      ],
      educations: [{ degree: "B.Sc. Computer Science", field: "Human-Computer Interaction", institution: "University of Edinburgh", startYear: 2018, endYear: 2022 }],
    },

    // 10 ── Raj Patel (Mobile / React Native, 4yr)
    { email: "raj@demo.com", firstName: "Raj", lastName: "Patel",
      headline: "Mobile Developer | React Native & iOS (Swift)",
      summary: "Cross-platform mobile engineer with 4 years shipping consumer apps to the App Store and Google Play. Obsessed with smooth animations and app performance.",
      skills: skills("React Native","TypeScript","Swift","iOS","Android","Firebase","Expo"),
      yearsExperience: 4, jobType: "full-time", location: "Chicago, IL, USA",
      salaryMin: 50000, salaryMax: 75000,
      experiences: [
        { title: "Senior Mobile Developer", company: "CRED", startDate: "2021-10", current: true,
          description: "Built flagship credit card management app with 8M+ downloads. Led migration from React Native 0.65 to 0.73.",
          skills: skills("React Native","TypeScript","iOS") },
        { title: "Mobile Developer", company: "OYO Rooms", startDate: "2020-05", endDate: "2021-09",
          description: "Hotel booking mobile app features and performance optimisations.",
          skills: skills("React Native","Firebase","Redux") },
      ],
      educations: [{ degree: "B.Tech. Information Technology", field: "Mobile Computing", institution: "BITS Pilani", startYear: 2016, endYear: 2020 }],
    },

    // 11 ── Chen Wei (ML Engineer, 6yr)
    { email: "chenwei@demo.com", firstName: "Chen", lastName: "Wei",
      headline: "ML / AI Engineer | NLP & Computer Vision",
      summary: "Machine learning engineer with 6 years across research and production ML systems. Published author in NLP. Expert in taking models from notebook to production API.",
      skills: skills("Python","PyTorch","Transformers","MLflow","AWS SageMaker","Docker","FastAPI"),
      yearsExperience: 6, jobType: "full-time", location: "San Francisco, CA, USA",
      salaryMin: 95000, salaryMax: 135000,
      experiences: [
        { title: "Senior ML Engineer", company: "Sea Group (Shopee)", startDate: "2021-01", current: true,
          description: "Built product recommendation engine serving 100M+ users. Improved CTR by 18% over baseline.",
          skills: skills("PyTorch","MLflow","Python","AWS") },
        { title: "ML Researcher", company: "Agency for Science, Technology and Research", startDate: "2018-07", endDate: "2020-12",
          description: "Published 3 papers in NLP. Fine-tuned BERT for healthcare information extraction.",
          skills: skills("Python","Transformers","NLP","Research") },
      ],
      educations: [{ degree: "M.Sc. Artificial Intelligence", field: "Natural Language Processing", institution: "Nanyang Technological University", startYear: 2016, endYear: 2018 }],
    },

    // 12 ── Fatima Al-Hassan (Full-Stack, 3yr)
    { email: "fatima@demo.com", firstName: "Fatima", lastName: "Al-Hassan",
      headline: "Full-Stack Developer | React, Node.js, MongoDB",
      summary: "Product-minded full-stack developer who loves building from idea to launch. Experience in e-commerce and edtech startups.",
      skills: skills("React","Node.js","MongoDB","Express","TypeScript","TailwindCSS","Vercel"),
      yearsExperience: 3, jobType: "full-time", location: "Miami, FL, USA",
      salaryMin: 50000, salaryMax: 75000,
      experiences: [
        { title: "Full-Stack Developer", company: "Noon (E-Commerce)", startDate: "2022-04", current: true,
          description: "Built new seller onboarding flows and internal tools. Shipped features serving 1M+ shoppers.",
          skills: skills("React","Node.js","MongoDB") },
        { title: "Junior Developer", company: "EdModo MENA", startDate: "2021-03", endDate: "2022-03",
          description: "Developed interactive learning modules and backend APIs.",
          skills: skills("React","Express","PostgreSQL") },
      ],
      educations: [{ degree: "B.Sc. Information Systems", field: "Web Development", institution: "American University of Sharjah", startYear: 2017, endYear: 2021 }],
    },

    // 13 ── Tyler Brooks (Junior Frontend, 1yr)
    { email: "tyler@demo.com", firstName: "Tyler", lastName: "Brooks",
      headline: "Junior Frontend Developer | React & Vanilla JS",
      summary: "Recent graduate passionate about web development. Strong fundamentals in HTML, CSS, and JavaScript with growing React experience.",
      skills: skills("JavaScript","React","HTML","CSS","Git","Figma"),
      yearsExperience: 1, jobType: "full-time", location: "Atlanta, GA, USA",
      salaryMin: 55000, salaryMax: 70000,
      experiences: [
        { title: "Junior Frontend Developer", company: "Local Digital Agency", startDate: "2023-09", current: true,
          description: "Building landing pages and marketing sites for small business clients.",
          skills: skills("HTML","CSS","JavaScript","WordPress") },
      ],
      educations: [{ degree: "B.Sc. Computer Science", field: "Web Technologies", institution: "Georgia State University", startYear: 2019, endYear: 2023 }],
    },

    // 14 ── Aisha Mohammed (Software Engineer, 4yr)
    { email: "aisha@demo.com", firstName: "Aisha", lastName: "Mohammed",
      headline: "Software Engineer | Java & Spring Boot",
      summary: "Backend engineer with 4 years building enterprise-grade microservices. Certified AWS Solutions Architect.",
      skills: skills("Java","Spring Boot","Microservices","PostgreSQL","Kafka","Docker","AWS"),
      yearsExperience: 4, jobType: "full-time", location: "Phoenix, AZ, USA",
      salaryMin: 55000, salaryMax: 80000,
      experiences: [
        { title: "Software Engineer", company: "Fawry (Fintech)", startDate: "2021-07", current: true,
          description: "Built payment processing microservices handling 500k+ daily transactions.",
          skills: skills("Java","Spring Boot","Kafka","Docker") },
        { title: "Junior Developer", company: "Vodafone Egypt", startDate: "2020-01", endDate: "2021-06",
          description: "Internal billing system maintenance and new feature development.",
          skills: skills("Java","Oracle","REST") },
      ],
      educations: [{ degree: "B.Sc. Computer Engineering", field: "Distributed Systems", institution: "Arizona State University", startYear: 2016, endYear: 2020 }],
    },

    // 15 ── Lucas Oliveira (Backend Java, 6yr)
    { email: "lucas@demo.com", firstName: "Lucas", lastName: "Oliveira",
      headline: "Senior Backend Engineer | Java, Kafka, Microservices",
      summary: "Seasoned backend engineer specialising in high-throughput event-driven systems. 6 years in fintech and logistics.",
      skills: skills("Java","Spring Boot","Kafka","Kubernetes","PostgreSQL","Redis","AWS"),
      yearsExperience: 6, jobType: "full-time", location: "Vancouver, BC, Canada",
      salaryMin: 85000, salaryMax: 115000,
      experiences: [
        { title: "Senior Backend Engineer", company: "Booking.com", startDate: "2020-09", current: true,
          description: "Event-driven microservices for hotel inventory and pricing engine. Handles 2M+ daily searches.",
          skills: skills("Java","Kafka","Kubernetes","AWS") },
        { title: "Backend Engineer", company: "Nubank Brazil", startDate: "2017-03", endDate: "2020-08",
          description: "Core banking APIs and payment integrations in Clojure and Java.",
          skills: skills("Java","Clojure","PostgreSQL","AWS") },
      ],
      educations: [{ degree: "B.Sc. Computer Science", field: "Software Engineering", institution: "University of São Paulo", startYear: 2013, endYear: 2017 }],
    },

    // 16 ── Sarah Kim (UX Researcher, 3yr)
    { email: "sarah@demo.com", firstName: "Sarah", lastName: "Kim",
      headline: "UX Researcher | Mixed Methods & Usability Testing",
      summary: "UX researcher who turns ambiguous problems into clear design opportunities. I run qualitative and quantitative studies that shape product strategy.",
      skills: skills("User Research","Usability Testing","Survey Design","Figma","Data Analysis","Accessibility"),
      yearsExperience: 3, jobType: "full-time", location: "Portland, OR, USA",
      salaryMin: 60000, salaryMax: 85000,
      experiences: [
        { title: "UX Researcher", company: "Kakao", startDate: "2022-02", current: true,
          description: "Ran 50+ usability studies and interviews per quarter. Shaped the redesign of KakaoTalk's main navigation.",
          skills: skills("User Research","Usability Testing","Survey Design") },
        { title: "Junior UX Researcher", company: "Samsung SDS", startDate: "2021-01", endDate: "2022-01",
          description: "Competitive analysis and heuristic evaluations for enterprise software.",
          skills: skills("Heuristic Evaluation","Competitor Analysis") },
      ],
      educations: [{ degree: "M.A. Human-Computer Interaction", field: "UX Research", institution: "KAIST", startYear: 2019, endYear: 2021 }],
    },

    // 17 ── David Mensah (Cloud Engineer, 5yr)
    { email: "david@demo.com", firstName: "David", lastName: "Mensah",
      headline: "Cloud / Infrastructure Engineer | GCP & Kubernetes",
      summary: "Platform engineer with 5 years building reliable, scalable cloud infrastructure. Advocate for GitOps and infrastructure-as-code.",
      skills: skills("GCP","Kubernetes","Terraform","Helm","GitHub Actions","Prometheus","Grafana"),
      yearsExperience: 5, jobType: "full-time", location: "Austin, TX, USA",
      salaryMin: 70000, salaryMax: 100000,
      experiences: [
        { title: "Senior Cloud Engineer", company: "MTN Group", startDate: "2021-08", current: true,
          description: "Designed and managed GKE clusters serving 10M+ mobile users. Implemented GitOps with ArgoCD.",
          skills: skills("GCP","Kubernetes","Terraform","Helm") },
        { title: "DevOps Engineer", company: "Rancard Solutions", startDate: "2019-03", endDate: "2021-07",
          description: "Built CI/CD pipelines and monitoring for SaaS products.",
          skills: skills("AWS","Docker","Jenkins","Prometheus") },
      ],
      educations: [{ degree: "B.Sc. Computer Engineering", field: "Networking & Cloud", institution: "KNUST", startYear: 2015, endYear: 2019 }],
    },

    // 18 ── Nina Petrova (Vue.js Frontend, 3yr)
    { email: "nina@demo.com", firstName: "Nina", lastName: "Petrova",
      headline: "Frontend Developer | Vue.js & Nuxt Specialist",
      summary: "Frontend developer with a keen eye for design and a passion for Vue.js. Experienced in building complex SPAs and SSR applications.",
      skills: skills("Vue.js","Nuxt","TypeScript","Pinia","TailwindCSS","REST APIs"),
      yearsExperience: 3, jobType: "full-time", location: "Vancouver, BC, Canada",
      salaryMin: 60000, salaryMax: 85000,
      experiences: [
        { title: "Frontend Developer", company: "Mollie (Payments)", startDate: "2022-03", current: true,
          description: "Built merchant-facing dashboard components. Led migration from Options API to Composition API.",
          skills: skills("Vue.js","TypeScript","TailwindCSS") },
        { title: "Junior Frontend Developer", company: "Coolblue", startDate: "2021-04", endDate: "2022-02",
          description: "E-commerce product listing and cart pages in Vue 2.",
          skills: skills("Vue.js","JavaScript","CSS") },
      ],
      educations: [{ degree: "B.Sc. Information Technology", field: "Web Development", institution: "Delft University of Technology", startYear: 2017, endYear: 2021 }],
    },

    // 19 ── Carlos Mendez (Android Developer, 4yr)
    { email: "carlos@demo.com", firstName: "Carlos", lastName: "Mendez",
      headline: "Android Developer | Kotlin & Jetpack Compose",
      summary: "Android specialist passionate about clean architecture and Material Design. 4 years shipping consumer and fintech apps on Google Play.",
      skills: skills("Kotlin","Android","Jetpack Compose","Room","Retrofit","Firebase","MVVM"),
      yearsExperience: 4, jobType: "full-time", location: "Mexico City, Mexico",
      salaryMin: 55000, salaryMax: 80000,
      experiences: [
        { title: "Android Developer", company: "Clip (Fintech)", startDate: "2021-11", current: true,
          description: "POS and payment Android app used by 500k+ merchants. Implemented Jetpack Compose migration.",
          skills: skills("Kotlin","Jetpack Compose","MVVM","Room") },
        { title: "Junior Android Developer", company: "Wizeline", startDate: "2020-05", endDate: "2021-10",
          description: "Client project Android development.",
          skills: skills("Kotlin","Android","Firebase") },
      ],
      educations: [{ degree: "B.Sc. Computer Science", field: "Mobile Systems", institution: "UNAM", startYear: 2016, endYear: 2020 }],
    },

    // 20 ── Yui Tanaka (Data Analyst, 2yr)
    { email: "yui@demo.com", firstName: "Yui", lastName: "Tanaka",
      headline: "Data Analyst | SQL, Python & Tableau",
      summary: "Data analyst with 2 years turning messy business data into actionable insights. Strong in SQL, Python, and storytelling with data.",
      skills: skills("SQL","Python","Tableau","dbt","Google Analytics","Excel","BigQuery"),
      yearsExperience: 2, jobType: "full-time", location: "Boston, MA, USA",
      salaryMin: 45000, salaryMax: 65000,
      experiences: [
        { title: "Data Analyst", company: "Mercari (E-Commerce)", startDate: "2023-04", current: true,
          description: "A/B test analysis and user cohort reporting for product decisions.",
          skills: skills("SQL","Python","BigQuery","Tableau") },
        { title: "Analyst Intern", company: "Dentsu", startDate: "2022-09", endDate: "2023-03",
          description: "Marketing analytics and campaign performance dashboards.",
          skills: skills("Excel","Google Analytics","PowerPoint") },
      ],
      educations: [{ degree: "B.A. Economics", field: "Statistics", institution: "Keio University", startYear: 2018, endYear: 2022 }],
    },

    // 21 ── Ibrahim Diallo (Full-Stack, 5yr)
    { email: "ibrahim@demo.com", firstName: "Ibrahim", lastName: "Diallo",
      headline: "Full-Stack Engineer | React & Django",
      summary: "5 years building products in edtech and agritech. Comfortable from database schema to React component. Proud open-source maintainer.",
      skills: skills("React","Django","PostgreSQL","AWS","TypeScript","REST APIs","Docker"),
      yearsExperience: 5, jobType: "full-time", location: "Houston, TX, USA",
      salaryMin: 45000, salaryMax: 65000,
      experiences: [
        { title: "Full-Stack Engineer", company: "Wave Mobile Money", startDate: "2020-10", current: true,
          description: "Built agent management and compliance features for mobile money platform serving 5M users.",
          skills: skills("React","Django","PostgreSQL","AWS") },
        { title: "Software Developer", company: "Andela", startDate: "2019-01", endDate: "2020-09",
          description: "Embedded with US client teams as a remote engineer.",
          skills: skills("JavaScript","Node.js","React") },
      ],
      educations: [{ degree: "B.Sc. Software Engineering", field: "Distributed Systems", institution: "Université Cheikh Anta Diop", startYear: 2015, endYear: 2019 }],
    },

    // 22 ── Hannah Schmidt (Product Designer, 4yr)
    { email: "hannah@demo.com", firstName: "Hannah", lastName: "Schmidt",
      headline: "Product Designer | Design Systems & SaaS",
      summary: "Systematic product designer with a background in front-end development. I bridge the gap between design and engineering to ship scalable, beautiful products.",
      skills: skills("Figma","Design Systems","Prototyping","User Research","HTML","CSS","Framer"),
      yearsExperience: 4, jobType: "full-time", location: "Boston, MA, USA",
      salaryMin: 65000, salaryMax: 90000,
      experiences: [
        { title: "Senior Product Designer", company: "N26 (Neobank)", startDate: "2021-06", current: true,
          description: "Led the rebrand of N26's design system used by 15 product teams. Drove accessibility improvements reducing WCAG violations by 70%.",
          skills: skills("Figma","Design Systems","Accessibility") },
        { title: "UI Designer", company: "Contentful", startDate: "2020-01", endDate: "2021-05",
          description: "Designed new dashboard features and onboarding flows.",
          skills: skills("Figma","Prototyping","User Testing") },
      ],
      educations: [{ degree: "B.A. Communication Design", field: "Interaction Design", institution: "Parsons School of Design", startYear: 2016, endYear: 2020 }],
    },

    // 23 ── Olumide Adeyemi (Backend Node.js, 3yr)
    { email: "olumide@demo.com", firstName: "Olumide", lastName: "Adeyemi",
      headline: "Backend Engineer | Node.js, GraphQL & AWS",
      summary: "Backend engineer focused on scalable APIs and developer experience. Advocate for API-first design and thorough documentation.",
      skills: skills("Node.js","TypeScript","GraphQL","PostgreSQL","AWS","Redis","Prisma"),
      yearsExperience: 3, jobType: "full-time", location: "Toronto, ON, Canada",
      salaryMin: 50000, salaryMax: 70000,
      experiences: [
        { title: "Backend Engineer", company: "Flutterwave", startDate: "2022-05", current: true,
          description: "Worked on payments API and webhook delivery systems. Improved P95 latency by 40%.",
          skills: skills("Node.js","TypeScript","GraphQL","AWS") },
        { title: "Junior Developer", company: "Cowrywise", startDate: "2021-06", endDate: "2022-04",
          description: "Investment API features and notification service development.",
          skills: skills("Node.js","PostgreSQL","Redis") },
      ],
      educations: [{ degree: "B.Sc. Computer Science", field: "Software Engineering", institution: "University of Ibadan", startYear: 2017, endYear: 2021 }],
    },

    // 24 ── Mei Lin (Frontend React, 2yr)
    { email: "meilin@demo.com", firstName: "Mei", lastName: "Lin",
      headline: "Frontend Developer | React & Next.js",
      summary: "Junior-to-mid frontend developer passionate about component-driven development and great user experience.",
      skills: skills("React","Next.js","TypeScript","CSS Modules","Jest","Storybook"),
      yearsExperience: 2, jobType: "full-time", location: "San Jose, CA, USA",
      salaryMin: 40000, salaryMax: 60000,
      experiences: [
        { title: "Frontend Developer", company: "Tencent (contract)", startDate: "2023-01", current: true,
          description: "Built internal tooling dashboard components in React.",
          skills: skills("React","TypeScript","Ant Design") },
        { title: "Intern", company: "ByteDance", startDate: "2022-07", endDate: "2022-12",
          description: "TikTok web team — feature development and A/B test implementations.",
          skills: skills("React","JavaScript","CSS") },
      ],
      educations: [{ degree: "B.Sc. Software Engineering", field: "Web Engineering", institution: "San Jose State University", startYear: 2018, endYear: 2022 }],
    },

    // 25 ── Samuel Nkosi (DevOps, 6yr)
    { email: "samuel@demo.com", firstName: "Samuel", lastName: "Nkosi",
      headline: "Senior DevOps Engineer | Kubernetes & GCP",
      summary: "Infrastructure-obsessed engineer with 6 years automating everything that can be automated. Kubernetes CKA certified.",
      skills: skills("Kubernetes","GCP","Terraform","Helm","Prometheus","Grafana","ArgoCD","Golang"),
      yearsExperience: 6, jobType: "full-time", location: "Calgary, AB, Canada",
      salaryMin: 75000, salaryMax: 105000,
      experiences: [
        { title: "Senior DevOps Engineer", company: "Takealot (SA E-Commerce)", startDate: "2020-02", current: true,
          description: "Migrated monolith to GKE microservices. Reduced infrastructure costs by 35%.",
          skills: skills("Kubernetes","GCP","Terraform","ArgoCD") },
        { title: "Systems Engineer", company: "FNB South Africa", startDate: "2018-07", endDate: "2020-01",
          description: "Linux server management and on-call operations.",
          skills: skills("Linux","Ansible","Monitoring") },
      ],
      educations: [{ degree: "B.Sc. Computer Science", field: "Systems Programming", institution: "University of Cape Town", startYear: 2014, endYear: 2018 }],
    },

    // 26 ── Anastasia Volkov (AI/ML, 4yr)
    { email: "anastasia@demo.com", firstName: "Anastasia", lastName: "Volkov",
      headline: "AI / ML Engineer | LLMs & Computer Vision",
      summary: "Applied ML engineer with 4 years delivering AI products in production. Specialises in fine-tuning LLMs and deploying computer vision pipelines.",
      skills: skills("Python","PyTorch","HuggingFace","OpenAI API","Computer Vision","FastAPI","AWS"),
      yearsExperience: 4, jobType: "full-time", location: "Boston, MA, USA",
      salaryMin: 90000, salaryMax: 130000,
      experiences: [
        { title: "ML Engineer", company: "Aleph Alpha (AI)", startDate: "2022-09", current: true,
          description: "Fine-tuned large language models for enterprise use cases. Built evaluation pipelines for model quality assurance.",
          skills: skills("PyTorch","HuggingFace","Python","MLflow") },
        { title: "Data Scientist", company: "Zalando", startDate: "2020-06", endDate: "2022-08",
          description: "Computer vision model for fashion product tagging. Reduced manual tagging effort by 60%.",
          skills: skills("Python","TensorFlow","Computer Vision","AWS") },
      ],
      educations: [{ degree: "M.Sc. Data Science", field: "Machine Learning", institution: "Carnegie Mellon University", startYear: 2018, endYear: 2020 }],
    },

    // 27 ── Kevin O'Brien (Full-Stack TypeScript, 5yr)
    { email: "kevin@demo.com", firstName: "Kevin", lastName: "O'Brien",
      headline: "Full-Stack Engineer | TypeScript End-to-End",
      summary: "TypeScript across the entire stack — React, Next.js, Node.js, Prisma. 5 years building and scaling startup products.",
      skills: skills("TypeScript","React","Next.js","Node.js","Prisma","PostgreSQL","tRPC","Tailwind"),
      yearsExperience: 5, jobType: "full-time", location: "Ottawa, ON, Canada",
      salaryMin: 80000, salaryMax: 115000,
      experiences: [
        { title: "Senior Full-Stack Engineer", company: "Intercom", startDate: "2021-04", current: true,
          description: "Built inbox and AI features serving 100k+ businesses. Migrated REST endpoints to tRPC.",
          skills: skills("TypeScript","React","Node.js","PostgreSQL") },
        { title: "Full-Stack Developer", company: "Stripe (contractor)", startDate: "2019-08", endDate: "2021-03",
          description: "Developer tools and dashboard features in React and Go.",
          skills: skills("React","TypeScript","Go","GraphQL") },
      ],
      educations: [{ degree: "B.Sc. Computer Science", field: "Software Engineering", institution: "University of Washington", startYear: 2014, endYear: 2018 }],
    },

    // 28 ── Zara Hassan (UX/UI Designer, 3yr)
    { email: "zara@demo.com", firstName: "Zara", lastName: "Hassan",
      headline: "UX/UI Designer | Mobile-First & Inclusive Design",
      summary: "Designer specialising in mobile UX for emerging markets. Experience across fintech, e-commerce, and health apps. Strong research background.",
      skills: skills("Figma","User Research","Mobile UX","Accessibility","Prototyping","Lottie Animations"),
      yearsExperience: 3, jobType: "full-time", location: "Seattle, WA, USA",
      salaryMin: 40000, salaryMax: 60000,
      experiences: [
        { title: "UX Designer", company: "M-Pesa / Vodacom", startDate: "2022-09", current: true,
          description: "Redesigned M-Pesa app for 30M+ users. Led inclusive design for low-literacy user testing.",
          skills: skills("Figma","Mobile UX","User Research") },
        { title: "Junior Designer", company: "Andela Design Guild", startDate: "2021-08", endDate: "2022-08",
          description: "UI design for client projects in healthcare and e-commerce.",
          skills: skills("Figma","Prototyping","Design Systems") },
      ],
      educations: [{ degree: "B.A. Graphic Design", field: "Digital Media", institution: "University of Nairobi", startYear: 2017, endYear: 2021 }],
    },

    // 29 ── Emmanuel Okonkwo (Software Engineer, 7yr)
    { email: "emmanuel@demo.com", firstName: "Emmanuel", lastName: "Okonkwo",
      headline: "Principal Engineer | Architecture & Team Leadership",
      summary: "7-year engineering career spanning IC work and tech lead roles. Expert in system design, mentoring, and building engineering culture.",
      skills: skills("System Design","TypeScript","Go","Kubernetes","PostgreSQL","Architecture","Team Leadership"),
      yearsExperience: 7, jobType: "full-time", location: "New York, NY, USA",
      salaryMin: 120000, salaryMax: 170000,
      experiences: [
        { title: "Tech Lead / Principal Engineer", company: "Revolut", startDate: "2020-05", current: true,
          description: "Led 8-person team building Revolut Business. Shaped the architecture for multi-currency ledger serving 1M+ businesses.",
          skills: skills("Go","PostgreSQL","Kafka","System Design") },
        { title: "Senior Software Engineer", company: "Transferwise (now Wise)", startDate: "2017-03", endDate: "2020-04",
          description: "International transfers core service. Improved FX pricing engine latency by 50%.",
          skills: skills("Java","Microservices","PostgreSQL","AWS") },
      ],
      educations: [{ degree: "M.Eng. Computer Science", field: "Distributed Systems", institution: "University of Warwick", startYear: 2013, endYear: 2017 }],
    },

    // 30 ── Lisa Park (Frontend Engineer, 3yr)
    { email: "lisa@demo.com", firstName: "Lisa", lastName: "Park",
      headline: "Frontend Engineer | React & Performance Optimisation",
      summary: "Performance-focused frontend engineer. I obsess over Core Web Vitals, bundle sizes, and render-blocking resources.",
      skills: skills("React","TypeScript","Next.js","Web Performance","Lighthouse","CSS","Testing Library"),
      yearsExperience: 3, jobType: "full-time", location: "Toronto, ON, Canada",
      salaryMin: 75000, salaryMax: 100000,
      experiences: [
        { title: "Frontend Engineer", company: "Shopify", startDate: "2022-09", current: true,
          description: "Storefront performance team. Reduced LCP by 35% and CLS by 50% on checkout pages.",
          skills: skills("React","Next.js","Web Performance","TypeScript") },
        { title: "Junior Frontend Developer", company: "FreshBooks", startDate: "2021-05", endDate: "2022-08",
          description: "Invoice and billing UI features in React.",
          skills: skills("React","JavaScript","SCSS") },
      ],
      educations: [{ degree: "B.Sc. Computer Science", field: "Human-Computer Interaction", institution: "University of Toronto", startYear: 2017, endYear: 2021 }],
    },
  ];

  // Create all seekers
  const seekers = [];
  for (const s of seekerData) {
    const user = await db.user.create({
      data: {
        email: s.email, passwordHash: HASH,
        role: "JOB_SEEKER", emailVerified: new Date(),
        jobSeekerProfile: {
          create: {
            firstName: s.firstName, lastName: s.lastName,
            headline: s.headline, summary: s.summary,
            skills: s.skills, yearsExperience: s.yearsExperience,
            jobType: s.jobType, location: s.location,
            salaryMin: s.salaryMin, salaryMax: s.salaryMax,
            workExperiences: { create: s.experiences.map(e => ({
              title: e.title, company: e.company, description: e.description,
              skills: e.skills, startDate: e.startDate,
              endDate: e.endDate ?? null, current: e.current ?? false,
            }))},
            educations: { create: s.educations.map(ed => ({
              degree: ed.degree, field: ed.field, institution: ed.institution,
              startYear: ed.startYear, endYear: ed.endYear ?? null,
            }))},
          },
        },
      },
      include: { jobSeekerProfile: true },
    });
    seekers.push(user);
  }

  // Aliases for readability
  const [jordan, casey, amara, james, priya, marcus, sofia, kwame, emma, raj,
         chenwei, fatima, tyler, aisha, lucas, sarah, david, nina, carlos, yui,
         ibrahim, hannah, olumide, meilin, samuel, anastasia, kevin, zara, emmanuel, lisa] = seekers;

  const [jFE, jBE, jPD,            // TechHire (r1)
         tFS, tRN, tDE,            // TechCorp (r3)
         fML, fBE, fSec,           // FinServe (r4)
         hFS, hUX, hPM,            // HealthFirst (r5)
         sxFS, sxGrowth,           // StartupX (r6)
         tbJava, tbDevOps, tbIOS,  // TalentBridge (r7)
         qhDev,                    // QuickHire (r8)
         tAndroid, r1QA, r4TW, r4SM, r7Vue, r5DA, r3DevOps] = jobs;

  // ════════════════════════════════════════════════════════════════════════════
  // APPLICATIONS
  // ════════════════════════════════════════════════════════════════════════════
  console.log("📋 Creating applications…");

  // Helper
  const apply = (jobId, user, status, coverLetter, revealed = false) =>
    db.application.create({ data: { jobId, userId: user.id, profileId: user.jobSeekerProfile.id, status, coverLetter, revealed } });

  const apps = await Promise.all([
    // Jordan (seeker 1) — 3 apps
    apply(jFE.id, jordan, "INTERVIEW_SCHEDULED",
      "I've spent 6 years building the kind of React architecture described here. I'd love to bring that to your client.", true),
    apply(jBE.id, jordan, "REVIEWING",
      "Node.js and PostgreSQL are my daily stack. Excited about the API design challenges in this role."),
    apply(tFS.id, jordan, "SHORTLISTED",
      "Full-stack across React and Node.js with real scale experience. Would love to contribute to TechCorp's mission."),

    // Amara — 2 apps
    apply(jFE.id, amara, "SHORTLISTED",
      "React and TypeScript are my core strengths. Happy to share my open-source work."),
    apply(tRN.id, amara, "REVIEWING",
      "I've been expanding into React Native and believe this role would be the perfect accelerator."),

    // James — 2 apps
    apply(fML.id, james, "INTERVIEW_SCHEDULED",
      "ML in financial services is exactly where I've spent the last 3 years. Let's talk.", true),
    apply(tDE.id, james, "SHORTLISTED",
      "Data pipelines and transformation layers are my speciality. Python, Spark, dbt — tick, tick, tick."),

    // Priya — 2 apps
    apply(jPD.id, priya, "REVIEWING",
      "I've been designing B2B SaaS products for 3 years. Attached: a case study on my last design system project."),
    apply(hUX.id, priya, "PENDING",
      "Design for health impact is something I care deeply about. Excited about this mission."),

    // Marcus — 2 apps
    apply(tbDevOps.id, marcus, "INTERVIEW_SCHEDULED",
      "7 years of Kubernetes and cloud infrastructure experience. I've built platforms at exactly this scale.", true),
    apply(r3DevOps.id, marcus, "SHORTLISTED",
      "GCP and Terraform are my comfort zone. Would love to chat about the platform vision."),

    // Sofia — 2 apps
    apply(hPM.id, sofia, "PENDING",
      "Product leadership in healthcare is where I'm looking to take my career next. Excited about this."),
    apply(r4SM.id, sofia, "REVIEWING",
      "I've coached 3 agile teams at Monzo. Happy to share my facilitation methodology."),

    // Kwame — 2 apps
    apply(fBE.id, kwame, "PENDING",
      "Django and Python APIs in fintech — this is exactly my background. Keen to contribute to FinServe's infrastructure."),
    apply(sxFS.id, kwame, "REVIEWING",
      "I love early-stage companies. High ownership and fast pace is where I do my best work."),

    // Raj — 2 apps
    apply(tRN.id, raj, "SHORTLISTED",
      "4 years in React Native, shipping consumer apps with 8M+ downloads. Ready for a new challenge."),
    apply(tbIOS.id, raj, "PENDING",
      "Swift and iOS is something I've been building alongside React Native. This contract is right up my alley."),

    // Chen Wei — 2 apps
    apply(fML.id, chenwei, "SHORTLISTED",
      "Production ML systems at scale is my speciality. Let me share my SageMaker architecture."),
    apply(tDE.id, chenwei, "REVIEWING",
      "Data engineering is a natural extension of my ML background. Python, Spark, and dbt — I use all three daily."),

    // Fatima — 2 apps
    apply(tFS.id, fatima, "PENDING",
      "Full-stack with React and Node.js — this maps directly to my experience at Noon."),
    apply(sxFS.id, fatima, "REVIEWING",
      "I love startup environments. High ownership and building from scratch is where I thrive."),

    // Tyler — 1 app
    apply(r1QA.id, tyler, "PENDING",
      "I'm early in my career but passionate about quality engineering and test automation."),

    // Aisha — 2 apps
    apply(tbJava.id, aisha, "INTERVIEW_SCHEDULED",
      "Java microservices and Kafka is my daily stack. 4 years in fintech, ready for the next challenge.", true),
    apply(fBE.id, aisha, "SHORTLISTED",
      "Python is my secondary stack and I've been expanding there. Excited about this fintech opportunity."),

    // Lucas — 2 apps
    apply(tbJava.id, lucas, "REVIEWING",
      "6 years in Java, Kafka, and high-throughput microservices. This role reads like my CV."),
    apply(r3DevOps.id, lucas, "PENDING",
      "I'm expanding into DevOps and infrastructure. Strong foundation in containerised Java services."),

    // Sarah — 2 apps
    apply(hUX.id, sarah, "SHORTLISTED",
      "UX research for health products in emerging markets — this is exactly the intersection I'm looking for."),
    apply(jPD.id, sarah, "REVIEWING",
      "Mixed-methods research background with design collaboration experience."),

    // David — 2 apps
    apply(r3DevOps.id, david, "INTERVIEW_SCHEDULED",
      "GCP and Kubernetes are my primary tools. I've run clusters serving 10M users — happy to discuss architecture.", true),
    apply(tbDevOps.id, david, "REVIEWING",
      "Strong Kubernetes and Terraform background. Excited about the remote-friendly setup."),

    // Nina — 2 apps
    apply(r7Vue.id, nina, "SHORTLISTED",
      "Vue.js and Nuxt with TypeScript is exactly my stack. I've shipped the Composition API migration at Mollie."),
    apply(jFE.id, nina, "PENDING",
      "I've been growing into React alongside Vue. This role would be a great step."),

    // Carlos — 2 apps
    apply(tAndroid.id, carlos, "REVIEWING",
      "Kotlin and Jetpack Compose — I've been building with this stack for 3 years and love it."),
    apply(tbIOS.id, carlos, "PENDING",
      "Looking to grow my iOS skills alongside Android. Swift is something I've been working on."),

    // Yui — 1 app
    apply(r5DA.id, yui, "PENDING",
      "SQL, Python, and data storytelling are my strengths. Excited about this role at HealthFirst."),

    // Ibrahim — 2 apps
    apply(tFS.id, ibrahim, "REVIEWING",
      "React and Django full-stack is exactly what I've built at Wave. Would love to bring that experience."),
    apply(hFS.id, ibrahim, "PENDING",
      "HealthTech is a space I care about deeply. My Django + React stack is a direct match."),

    // Hannah — 2 apps
    apply(hUX.id, hannah, "SHORTLISTED",
      "Accessible design systems for health apps is where my career is heading. Let me share my HealthFirst concept."),
    apply(jPD.id, hannah, "REVIEWING",
      "Design systems and B2B SaaS design is my core expertise. Excited about this opportunity."),

    // Olumide — 2 apps
    apply(jBE.id, olumide, "SHORTLISTED",
      "Node.js, TypeScript, GraphQL, and AWS — this is my exact stack at Flutterwave."),
    apply(tFS.id, olumide, "PENDING",
      "Full-stack experience across Node.js and React. Ready for a new challenge at TechCorp."),

    // Mei Lin — 1 app
    apply(jFE.id, meilin, "PENDING",
      "2 years of React development experience. Keen to grow in a senior-heavy team."),

    // Samuel — 2 apps
    apply(tbDevOps.id, samuel, "REVIEWING",
      "Senior DevOps with Kubernetes CKA and 6 years in infrastructure. Strong match for this role."),
    apply(r3DevOps.id, samuel, "PENDING",
      "GCP and Kubernetes at scale — I've been running exactly this kind of platform."),

    // Anastasia — 2 apps
    apply(fML.id, anastasia, "REVIEWING",
      "Production ML with LLMs and computer vision. Fine-tuning at scale is my speciality."),
    apply(tDE.id, anastasia, "PENDING",
      "Data engineering complements my ML background. Python and Spark pipelines are a daily tool."),

    // Kevin — 2 apps
    apply(tFS.id, kevin, "PENDING",
      "TypeScript end-to-end, React, Node.js, Prisma — I use this exact stack daily."),
    apply(jFE.id, kevin, "REVIEWING",
      "5 years of TypeScript and React in production. Happy to discuss architecture approach."),

    // Zara — 2 apps
    apply(hUX.id, zara, "REVIEWING",
      "Mobile UX for emerging markets — this is where I do my deepest work. M-Pesa experience directly relevant."),
    apply(jPD.id, zara, "PENDING",
      "Product design with research background. Keen to contribute to this team."),

    // Emmanuel — 2 apps
    apply(tbJava.id, emmanuel, "PENDING",
      "7 years in distributed systems and team leadership. This senior Java role is a strong match."),
    apply(jBE.id, emmanuel, "REVIEWING",
      "Principal-level backend experience. Happy to discuss system design approach for this role."),

    // Lisa — 2 apps
    apply(jFE.id, lisa, "PENDING",
      "Frontend performance is my speciality. React, Next.js, Core Web Vitals — I've shipped improvements at Shopify."),
    apply(tFS.id, lisa, "PENDING",
      "Strong React and TypeScript background. Interested in the full-stack growth opportunity."),
  ]);

  // ════════════════════════════════════════════════════════════════════════════
  // INTERVIEWS (for INTERVIEW_SCHEDULED applications)
  // ════════════════════════════════════════════════════════════════════════════
  console.log("📅 Creating interviews…");

  // Find the apps that are INTERVIEW_SCHEDULED (Jordan/jFE, James/fML, Marcus/tbDevOps, Aisha/tbJava, David/r3DevOps)
  const scheduledApps = await db.application.findMany({
    where: { status: "INTERVIEW_SCHEDULED" },
  });

  const interviewData = [
    { duration: 60,  type: "video",     link: "https://meet.google.com/abc-defg-hij", notes: "First round. Focus on React architecture and system design." },
    { duration: 45,  type: "video",     link: "https://zoom.us/j/1234567890",        notes: "Technical screen. Bring 2–3 examples of ML models in production." },
    { duration: 60,  type: "video",     link: "https://meet.google.com/xyz-uvwx-yz",  notes: "Infrastructure deep-dive. Prepare to whiteboard a Kubernetes deployment." },
    { duration: 60,  type: "phone",     link: null,                                  notes: "First technical screen. Discuss Java microservices experience." },
    { duration: 45,  type: "video",     link: "https://meet.google.com/kkk-mno-pqr", notes: "Platform engineering discussion. Bring your Terraform experience." },
  ];

  await Promise.all(scheduledApps.map((app, i) => {
    const iv = interviewData[i % interviewData.length];
    const employer = [r1, r4, r7, r7, r3][i % 5];
    return db.interview.create({ data: {
      applicationId: app.id,
      scheduledById: employer.id,
      scheduledAt: future(3 + i * 2),
      duration: iv.duration,
      type: iv.type,
      meetingLink: iv.link,
      notes: iv.notes,
    }});
  }));

  // ════════════════════════════════════════════════════════════════════════════
  // CONVERSATIONS & MESSAGES
  // ════════════════════════════════════════════════════════════════════════════
  console.log("💬 Creating conversations & messages…");

  // Create conversations for revealed applications
  const revealedApps = await db.application.findMany({
    where: { revealed: true },
    include: { job: { include: { postedBy: true } } },
  });

  for (const app of revealedApps) {
    const conv = await db.conversation.create({ data: { applicationId: app.id } });
    const employer = app.job.postedBy;
    const seeker = await db.user.findUnique({ where: { id: app.userId } });

    // Thread of messages
    const thread = [
      { senderId: employer.id, body: "Hi! We've reviewed your application and are excited to move forward. Looking forward to our interview." },
      { senderId: seeker.id,   body: "Thank you so much! I'm really excited about this opportunity. Happy to prepare anything specific beforehand?" },
      { senderId: employer.id, body: "Great to hear! Please prepare a walkthrough of a recent project you're proud of — ideally something with real technical depth." },
      { senderId: seeker.id,   body: "Perfect. I have a great example from my current role — a performance optimisation project that cut load time by 40%. I'll walk through the architecture." },
      { senderId: employer.id, body: "That sounds ideal. We'll send the meeting link and calendar invite shortly. See you then!" },
    ];

    for (const msg of thread) {
      await db.message.create({ data: { conversationId: conv.id, senderId: msg.senderId, body: msg.body } });
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ════════════════════════════════════════════════════════════════════════════
  const counts = await Promise.all([
    db.user.count(),
    db.job.count(),
    db.application.count(),
    db.interview.count(),
    db.conversation.count(),
    db.message.count(),
  ]);

  console.log("\n✅ Seed complete!\n");
  console.log(`   Users:         ${counts[0]}`);
  console.log(`   Jobs:          ${counts[1]}`);
  console.log(`   Applications:  ${counts[2]}`);
  console.log(`   Interviews:    ${counts[3]}`);
  console.log(`   Conversations: ${counts[4]}`);
  console.log(`   Messages:      ${counts[5]}`);

  console.log("\n🔑 Admin account:");
  console.log("  admin@equalhires.com  — password: Admin@Equalhires2024!");
  console.log("\n📧 Demo accounts (password: demo1234)\n");
  console.log("RECRUITERS:");
  console.log("  recruiter.active@demo.com  — TechHire Solutions (agency, 3 jobs)");
  console.log("  recruiter.new@demo.com     — Bright Futures Staffing (no jobs yet)");
  console.log("  techcorp@demo.com          — TechCorp Africa (4 jobs)");
  console.log("  fintech@demo.com           — FinServe Innovation (3 jobs)");
  console.log("  healthtech@demo.com        — HealthFirst Tech (4 jobs)");
  console.log("  startupx@demo.com          — StartupX (2 jobs)");
  console.log("  agency@demo.com            — TalentBridge Agency (4 jobs)");
  console.log("  lowtrust@demo.com          — QuickHire (low trust, 1 job)\n");
  console.log("JOB SEEKERS:");
  console.log("  seeker.active@demo.com     — Jordan Rivera | Full-Stack, 6yr | multiple apps + interview");
  console.log("  seeker.new@demo.com        — Casey Okafor  | new account, empty profile");
  console.log("  amara@demo.com             — Amara Obi     | React Developer, 4yr");
  console.log("  james@demo.com             — James Chen    | Data Scientist, 5yr | interview scheduled");
  console.log("  priya@demo.com             — Priya Sharma  | UX Designer, 3yr");
  console.log("  marcus@demo.com            — Marcus Johnson | DevOps, 7yr | interview scheduled");
  console.log("  …and 24 more — see seed.js for the full list\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
