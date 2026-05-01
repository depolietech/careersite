import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ChatResponse {
  reply: string;
  suggestions: string[];
  links?: { label: string; href: string }[];
}

function detectIntent(msg: string): string {
  const m = msg.toLowerCase().trim();

  if (/\b(hi|hello|hey|howdy|greetings|good morning|good afternoon|good evening)\b/.test(m))
    return "greeting";

  if (
    /\b(bias|anonymous|masked|masking|privacy|hidden|reveal|identity|fair|discrimination|diverse|diversity|unconscious)\b/.test(
      m
    )
  )
    return "bias";

  if (
    /\b(how.*(work|start|begin|use)|get started|new here|first time|what is this|tell me about|explain|overview)\b/.test(
      m
    )
  )
    return "onboarding";

  if (
    /\b(find job|search job|browse job|look.*job|job listing|open position|available job|job opening|show.*job|see.*job|what job|all job)\b/.test(
      m
    )
  )
    return "jobs_search";

  if (/\bjobs?\b/.test(m) && !/apply|application|track|status|my/.test(m)) return "jobs_search";

  if (/\b(how.*apply|how do i apply|applying|submit application|send application)\b/.test(m))
    return "apply";

  if (/\bapply\b/.test(m) && !/how/.test(m)) return "apply";

  if (
    /\b(track|status|check.*application|my application|where.*application|application.*status|applied|what.*application)\b/.test(
      m
    )
  )
    return "track";

  if (/\binterview\b/.test(m)) return "interview";

  if (/\b(resume|cv|curriculum vitae|upload.*resume|my resume|pdf)\b/.test(m)) return "resume";

  if (/\b(profile|complete.*profile|edit.*profile|update.*profile|my profile|strengthen)\b/.test(m))
    return "profile";

  if (/\b(notification|alert|bell|unread|update.*me)\b/.test(m)) return "notifications";

  if (
    /\b(employer|post.*job|hire|recruiter|hiring manager|talent|candidate|i.*hiring|company)\b/.test(
      m
    )
  )
    return "employer";

  if (
    /\b(where|how.*get|navigate|navigation|go to|find.*page|settings|menu|dashboard|home page)\b/.test(
      m
    )
  )
    return "navigation";

  if (/\b(help|support|assist|problem|issue|trouble|contact|stuck|faq)\b/.test(m)) return "help";

  if (
    /\b(login|log in|sign in|account|password|forgot password|sign up|register|create account|log out|sign out)\b/.test(
      m
    )
  )
    return "account";

  return "fallback";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message : "";

    if (!message.trim()) {
      return NextResponse.json<ChatResponse>({
        reply: "Please type a message so I can help you.",
        suggestions: ["How does it work?", "Find jobs", "Track my applications"],
      });
    }

    const session = await auth();
    // Keep userId as string | undefined so Prisma narrowing works after !userId checks
    const userId = session?.user?.id;
    const userRole = (session?.user as { role?: string } | undefined)?.role ?? null;

    const intent = detectIntent(message);
    let response: ChatResponse;

    switch (intent) {
      case "greeting": {
        if (userId && userRole === "JOB_SEEKER") {
          response = {
            reply: "Hello! I'm your Bias-Free Careers assistant. How can I help you today?",
            suggestions: [
              "Show my applications",
              "Find jobs",
              "How does anonymous hiring work?",
              "Update my profile",
            ],
          };
        } else if (userId && userRole === "EMPLOYER") {
          response = {
            reply: "Hello! How can I help you with your hiring today?",
            suggestions: [
              "How do I post a job?",
              "View my applicants",
              "How does bias-free screening work?",
            ],
          };
        } else {
          response = {
            reply:
              "Hello! Welcome to Bias-Free Careers — where hiring is based on skills, not identity. How can I help you?",
            suggestions: [
              "How does it work?",
              "Find jobs",
              "I'm an employer",
              "Create an account",
            ],
          };
        }
        break;
      }

      case "onboarding": {
        if (userId && userRole === "JOB_SEEKER") {
          response = {
            reply:
              "Here's how to get started as a job seeker:\n\n1. **Complete your profile** — add your skills, experience, and education\n2. **Browse jobs** — filter by type, location, or keyword\n3. **Apply** — one click; your identity stays masked until an interview is scheduled\n4. **Track progress** — check your dashboard for real-time status updates",
            suggestions: [
              "Update my profile",
              "Browse jobs",
              "Track my applications",
              "How does masking work?",
            ],
            links: [
              { label: "Complete Profile", href: "/profile" },
              { label: "Browse Jobs", href: "/jobs" },
              { label: "My Dashboard", href: "/dashboard" },
            ],
          };
        } else if (userId && userRole === "EMPLOYER") {
          response = {
            reply:
              "Here's how to get started as an employer:\n\n1. **Post a job** — describe the role, required skills, and requirements\n2. **Review applicants** — all profiles are anonymized (names, dates, and photos hidden)\n3. **Shortlist candidates** — evaluate based purely on skills\n4. **Schedule interviews** — identities are revealed only after scheduling\n5. **Hire fairly** — diverse shortlists, better outcomes for everyone",
            suggestions: ["Post a job", "View my applicants", "How does masking work?"],
            links: [
              { label: "Post a Job", href: "/employer/post-job" },
              { label: "View Applicants", href: "/employer/applicants" },
            ],
          };
        } else {
          response = {
            reply:
              "Bias-Free Careers works in 3 simple steps:\n\n🛡️ **Apply Anonymously** — Your name, photo, and personal details are hidden from employers\n\n⚡ **Get Evaluated Fairly** — Employers see only your skills and experience\n\n🔒 **Identity Revealed at Interview** — Your personal details are only shared once an interview is scheduled\n\nIt's completely free for job seekers!",
            suggestions: [
              "Create a job seeker account",
              "I'm an employer",
              "How does profile masking work?",
              "Browse open jobs",
            ],
            links: [
              { label: "Get Started Free", href: "/register?role=job-seeker" },
              { label: "Browse Jobs", href: "/jobs" },
            ],
          };
        }
        break;
      }

      case "jobs_search": {
        const jobCount = await db.job.count({ where: { status: "ACTIVE" } });
        if (jobCount > 0) {
          response = {
            reply: `There are currently **${jobCount} active job${jobCount !== 1 ? "s" : ""}** on Bias-Free Careers. You can browse all listings and filter by job type, location, or required skills.${
              !userId ? "\n\nBrowsing is free — you'll need an account to apply." : ""
            }`,
            suggestions: [
              "How do I apply?",
              "What types of jobs are listed?",
              "Update my profile",
              "Track my applications",
            ],
            links: [{ label: "Browse All Jobs", href: "/jobs" }],
          };
        } else {
          response = {
            reply:
              "No active jobs are listed right now, but new positions are posted regularly. Check back soon or set up your profile so you're ready to apply when listings go live.",
            suggestions: ["Create an account", "How does it work?", "I'm an employer"],
            links: [
              { label: "Browse Jobs", href: "/jobs" },
              { label: "Create Account", href: "/register?role=job-seeker" },
            ],
          };
        }
        break;
      }

      case "apply": {
        if (!userId) {
          response = {
            reply:
              "To apply to jobs on Bias-Free Careers:\n\n1. **Create a free account** as a job seeker\n2. **Complete your profile** — add skills, experience, and education\n3. **Browse jobs** and click Apply on any listing\n4. Add an optional cover letter to stand out\n5. Your application is submitted anonymously — identity masked until an interview",
            suggestions: ["Create an account", "How does masking work?", "Browse jobs"],
            links: [
              { label: "Create Account", href: "/register?role=job-seeker" },
              { label: "Browse Jobs", href: "/jobs" },
            ],
          };
        } else if (userRole !== "JOB_SEEKER") {
          response = {
            reply:
              "Applying to jobs is a feature for job seekers. As an employer, you can post jobs and review incoming applications from your dashboard.",
            suggestions: ["Post a job", "View my applicants"],
            links: [{ label: "Post a Job", href: "/employer/post-job" }],
          };
        } else {
          response = {
            reply:
              "To apply to a job:\n\n1. Go to **Browse Jobs**\n2. Click on any job to view details\n3. Click **Apply** and add an optional cover letter\n4. Submit — your identity stays hidden until an interview is scheduled\n\nYour profile (skills, experience, education) is what employers see — make sure it's complete!",
            suggestions: ["Browse jobs", "Update my profile", "Track my applications"],
            links: [{ label: "Browse Jobs", href: "/jobs" }],
          };
        }
        break;
      }

      case "track": {
        if (!userId) {
          response = {
            reply:
              "To track your applications you need to sign in. Once logged in, your dashboard shows all applications with real-time status updates — Applied, Under Review, Shortlisted, Interview Stage, and more.",
            suggestions: ["Sign in", "Create an account", "How does it work?"],
            links: [
              { label: "Sign In", href: "/login" },
              { label: "Create Account", href: "/register?role=job-seeker" },
            ],
          };
        } else if (userRole !== "JOB_SEEKER") {
          response = {
            reply:
              "As an employer, you can track your posted jobs and applicants from your dashboard.",
            suggestions: ["View my applicants", "View posted jobs"],
            links: [{ label: "Employer Dashboard", href: "/employer/dashboard" }],
          };
        } else {
          // userId is string here — TypeScript narrowed by !userId check above
          const apps = await db.application.findMany({
            where: { userId },
            select: { status: true },
          });

          const total = apps.length;
          const interviews = apps.filter((a) => a.status === "INTERVIEW_SCHEDULED").length;
          const shortlisted = apps.filter(
            (a) => a.status === "SHORTLISTED" || a.status === "OFFER_MADE"
          ).length;
          const pending = apps.filter((a) => a.status === "PENDING").length;
          const reviewing = apps.filter((a) => a.status === "REVIEWING").length;

          if (total === 0) {
            response = {
              reply:
                "You haven't applied to any jobs yet. Browse our active listings and start applying — it's completely free!",
              suggestions: ["Browse jobs", "How do I apply?", "Complete my profile"],
              links: [{ label: "Browse Jobs", href: "/jobs" }],
            };
          } else {
            const lines = [
              `You have **${total} application${total !== 1 ? "s" : ""}** in total:`,
            ];
            if (pending > 0) lines.push(`• ${pending} pending review`);
            if (reviewing > 0) lines.push(`• ${reviewing} under review`);
            if (shortlisted > 0) lines.push(`• ${shortlisted} shortlisted`);
            if (interviews > 0)
              lines.push(`• ${interviews} interview${interviews !== 1 ? "s" : ""} scheduled 🎉`);

            response = {
              reply: lines.join("\n"),
              suggestions: [
                "View my dashboard",
                "How does interview scheduling work?",
                "Browse more jobs",
              ],
              links: [{ label: "Go to Dashboard", href: "/dashboard" }],
            };
          }
        }
        break;
      }

      case "interview": {
        if (!userId) {
          response = {
            reply:
              "Interviews on Bias-Free Careers work differently:\n\n🔒 **Before interview:** Your identity is fully anonymous\n📅 **Interview scheduled:** The employer requests an interview with you\n✅ **Reveal:** Your name and personal details are shared with the employer\n📹 **Interview types:** Video call, phone, or in-person\n\nThis ensures you're evaluated on your skills first — not who you are.",
            suggestions: ["Create an account", "How does masking work?", "Browse jobs"],
            links: [{ label: "Create Account", href: "/register?role=job-seeker" }],
          };
        } else if (userRole === "JOB_SEEKER") {
          const interviewCount = await db.application.count({
            where: { userId, status: "INTERVIEW_SCHEDULED" },
          });

          if (interviewCount > 0) {
            response = {
              reply: `You have **${interviewCount} interview${interviewCount !== 1 ? "s" : ""}** scheduled! 🎉\n\nYour identity has been revealed to the employer. Head to your dashboard to view meeting details and the joining link.`,
              suggestions: ["Go to my dashboard", "Browse more jobs"],
              links: [{ label: "View Dashboard", href: "/dashboard" }],
            };
          } else {
            response = {
              reply:
                "You don't have any interviews scheduled yet.\n\nWhen an employer shortlists you and schedules an interview:\n• You'll receive a notification\n• Your identity is revealed to the employer\n• A meeting link will appear in your dashboard",
              suggestions: ["Track my applications", "Browse jobs", "Update my profile"],
              links: [{ label: "Go to Dashboard", href: "/dashboard" }],
            };
          }
        } else {
          response = {
            reply:
              "As an employer, you can schedule interviews from the applicant review page. When you schedule an interview, the candidate's full profile is automatically revealed to you.",
            suggestions: ["View my applicants", "How does masking work?"],
            links: [{ label: "View Applicants", href: "/employer/applicants" }],
          };
        }
        break;
      }

      case "resume": {
        if (!userId) {
          response = {
            reply:
              "You can store up to **3 resumes** (PDF format, max 5 MB each) in your Bias-Free Careers account.\n\nResumes are managed from your profile — they supplement your anonymous profile when employers reveal your identity after scheduling an interview.",
            suggestions: ["Create an account", "Browse jobs", "How does it work?"],
            links: [{ label: "Create Account", href: "/register?role=job-seeker" }],
          };
        } else if (userRole === "JOB_SEEKER") {
          const resumeCount = await db.resume.count({ where: { userId } });
          response = {
            reply:
              resumeCount > 0
                ? `You have **${resumeCount} resume${resumeCount !== 1 ? "s" : ""}** saved (max 3 allowed).\n\nYour resumes are shared with employers when your identity is revealed after an interview is scheduled.`
                : "You haven't uploaded any resumes yet. Resumes can be added from your profile — they're shared with employers after an interview is scheduled.",
            suggestions: ["Update my profile", "Browse jobs", "Track my applications"],
            links: [{ label: "Edit Profile", href: "/profile" }],
          };
        } else {
          response = {
            reply:
              "Resume upload is a feature for job seekers. As an employer, you can view candidate resumes after an interview is scheduled.",
            suggestions: ["View my applicants", "Post a job"],
          };
        }
        break;
      }

      case "profile": {
        if (!userId) {
          response = {
            reply:
              "Your profile on Bias-Free Careers includes:\n\n• **Skills & experience** — always visible to employers\n• **Work history** — role duration shown, company names masked\n• **Education** — degree shown, institution masked\n• **Personal details** — hidden until an interview is scheduled\n\nA complete profile helps you get shortlisted faster!",
            suggestions: ["Create an account", "How does masking work?"],
            links: [{ label: "Create Account", href: "/register?role=job-seeker" }],
          };
        } else if (userRole === "JOB_SEEKER") {
          response = {
            reply:
              "A strong profile increases your chances of being shortlisted.\n\nProfile checklist:\n✅ Clear professional headline\n✅ Key skills listed\n✅ Work experience added (company names are masked automatically)\n✅ Education history included\n✅ Years of experience filled in",
            suggestions: ["Edit my profile", "Browse jobs", "Track my applications"],
            links: [{ label: "Edit Profile", href: "/profile" }],
          };
        } else {
          response = {
            reply:
              "Your company profile helps job seekers understand who they're applying to. Keep it updated with your company description, industry, and location.",
            suggestions: ["Post a job", "View my applicants"],
          };
        }
        break;
      }

      case "notifications": {
        if (!userId) {
          response = {
            reply:
              "Notifications keep you updated on your job applications and hiring activity. Sign in to see yours.",
            suggestions: ["Sign in", "Create an account"],
            links: [{ label: "Sign In", href: "/login" }],
          };
        } else {
          const unread = await db.notification.count({
            where: { userId, read: false },
          });
          const notificationsHref =
            userRole === "EMPLOYER" ? "/employer/notifications" : "/notifications";

          response = {
            reply:
              unread > 0
                ? `You have **${unread} unread notification${unread !== 1 ? "s" : ""}**! Check your notifications for the latest updates on your applications and hiring activity.`
                : "You have no unread notifications. Notifications appear when you apply to a job, your application status changes, or an interview is scheduled.",
            suggestions: ["View notifications", "Track my applications", "Browse jobs"],
            links: [{ label: "View Notifications", href: notificationsHref }],
          };
        }
        break;
      }

      case "bias": {
        response = {
          reply:
            "**How anonymous hiring works on Bias-Free Careers:**\n\n🛡️ **Hidden from employers:**\n• Your name and photo\n• School and university names\n• Employment dates and company names\n• Phone number\n\n👀 **Visible to employers:**\n• Your skills and years of experience\n• Job title and role description\n• Duration of each role\n• Degree type and field\n\n🔓 **When your identity is revealed:**\nOnly when an employer schedules an interview with you — never before.",
          suggestions: [
            "Create an account",
            "How does interview reveal work?",
            "Browse jobs",
            "How does it work?",
          ],
          links: [{ label: "Learn More", href: "/#how-it-works" }],
        };
        break;
      }

      case "employer": {
        if (!userId) {
          response = {
            reply:
              "As an employer on Bias-Free Careers, you can:\n\n• **Post jobs** — describe the role and required skills\n• **Review anonymous candidates** — evaluated on skills only\n• **Shortlist fairly** — no unconscious bias\n• **Schedule interviews** — candidate identity is revealed automatically\n\nCompanies using anonymous hiring report **3× more diverse shortlists**.",
            suggestions: ["Create employer account", "How does screening work?", "What's the cost?"],
            links: [{ label: "Start Hiring", href: "/register?role=employer" }],
          };
        } else if (userRole === "EMPLOYER") {
          response = {
            reply:
              "You're logged in as an employer. Here's what you can do:\n\n• **Post a new job** to attract qualified candidates\n• **Review applicants** anonymously on your dashboard\n• **Schedule interviews** when you find a match\n• Check **notifications** for new applications",
            suggestions: ["Post a job", "View applicants", "View notifications"],
            links: [
              { label: "Post a Job", href: "/employer/post-job" },
              { label: "View Applicants", href: "/employer/applicants" },
            ],
          };
        } else {
          response = {
            reply:
              "Employer accounts are for companies and recruiters looking to hire. You're currently logged in as a job seeker. If you need an employer account, you can create a separate one.",
            suggestions: ["Browse jobs", "Track my applications", "How does it work?"],
            links: [{ label: "Create Employer Account", href: "/register?role=employer" }],
          };
        }
        break;
      }

      case "navigation": {
        let navMap: string;
        if (userId && userRole === "JOB_SEEKER") {
          navMap =
            "• **Dashboard** → /dashboard — track your applications\n• **Browse Jobs** → /jobs — find and apply\n• **Profile** → /profile — manage your profile\n• **Notifications** → /notifications — application updates\n• **Settings** → /settings — account preferences";
        } else if (userId && userRole === "EMPLOYER") {
          navMap =
            "• **Dashboard** → /employer/dashboard — your hiring overview\n• **Post a Job** → /employer/post-job — create a listing\n• **Applicants** → /employer/applicants — review candidates\n• **Notifications** → /employer/notifications — new application alerts";
        } else {
          navMap =
            "• **Home** → / — platform overview and latest jobs\n• **Browse Jobs** → /jobs — explore open positions\n• **Sign In** → /login — access your account\n• **Register** → /register — create a new account";
        }

        response = {
          reply: `Here's how to navigate the platform:\n\n${navMap}`,
          suggestions: userId
            ? ["Track my applications", "Browse jobs", "View notifications"]
            : ["Sign in", "Create an account", "Browse jobs"],
        };
        break;
      }

      case "help": {
        response = {
          reply:
            "Need help? Here are some resources:\n\n• **Help Center** — detailed guides and FAQs\n• **FAQ section** — common questions on the homepage\n• **This assistant** — ask me anything about the platform!\n\nI can help with job searching, applications, your profile, resume uploads, and more.",
          suggestions: [
            "How does it work?",
            "Track my applications",
            "Find jobs",
            "Contact support",
          ],
          links: [{ label: "Help Center", href: "/help" }],
        };
        break;
      }

      case "account": {
        if (userId) {
          response = {
            reply:
              "You're already signed in! You can manage your account settings, change your password, and update preferences from the Settings page.",
            suggestions: ["Go to settings", "Edit my profile", "Track my applications"],
            links: [{ label: "Account Settings", href: "/settings" }],
          };
        } else {
          response = {
            reply:
              "To get started on Bias-Free Careers:\n\n👤 **Job Seeker** — free account to apply to jobs anonymously\n🏢 **Employer** — post jobs and review bias-free applications\n\nAlready have an account? Sign in to continue.",
            suggestions: [
              "Create job seeker account",
              "Create employer account",
              "Sign in",
            ],
            links: [
              { label: "Sign In", href: "/login" },
              { label: "Create Account", href: "/register" },
            ],
          };
        }
        break;
      }

      default: {
        response = {
          reply:
            "I'm not sure I understood that. I can help with:\n\n• Finding and applying to jobs\n• Tracking your applications\n• Understanding anonymous hiring\n• Profile and resume help\n• Navigation guidance\n• Interview information\n\nWhat would you like to know?",
          suggestions: [
            "Find jobs",
            "Track my applications",
            "How does it work?",
            "Update my profile",
          ],
        };
      }
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json<ChatResponse>({
      reply: "Something went wrong. Please try again in a moment.",
      suggestions: ["How does it work?", "Find jobs", "Track my applications"],
    });
  }
}
