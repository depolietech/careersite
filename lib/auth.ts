import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import MicrosoftEntraId from "next-auth/providers/microsoft-entra-id";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import type { AdapterUser } from "@auth/core/adapters";

const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com",
  "icloud.com", "me.com", "mac.com", "aol.com", "protonmail.com",
  "proton.me", "tutanota.com", "zoho.com", "yandex.com",
]);

const baseAdapter = PrismaAdapter(db);

const customAdapter = {
  ...baseAdapter,
  async createUser(user: Omit<AdapterUser, "id">) {
    const cookieStore = await cookies();
    const pendingRole = cookieStore.get("oauth_pending_role")?.value;
    const role = pendingRole === "EMPLOYER" ? "EMPLOYER" : "JOB_SEEKER";

    const emailDomain = user.email?.split("@")[1]?.toLowerCase() ?? "";
    const isPublicEmail = PUBLIC_EMAIL_DOMAINS.has(emailDomain);

    const newUser = await db.user.create({
      data: {
        email: user.email!,
        emailVerified: new Date(),
        role,
        isPublicEmail,
      },
    });

    if (role === "EMPLOYER") {
      await db.employerProfile.create({
        data: {
          userId: newUser.id,
          companyName: "",
          trustScore: isPublicEmail ? 60 : 100,
          verificationStatus: "INCOMPLETE",
        },
      });
    } else {
      await db.jobSeekerProfile.create({
        data: { userId: newUser.id, skills: "[]", firstName: "", lastName: "" },
      });
    }

    return { ...newUser } as AdapterUser;
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: customAdapter,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
          include: { employerProfile: true },
        });

        if (!user || !user.passwordHash) return null;

        // Check account state BEFORE validating password
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        if (user.role === "EMPLOYER" && user.employerProfile) {
          if (user.employerProfile.isBlocked) throw new Error("ACCOUNT_SUSPENDED");
          if (user.employerProfile.verificationStatus === "PENDING_REVIEW") throw new Error("ACCOUNT_PENDING_APPROVAL");
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          isEmailVerified: true,
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorMethod: user.twoFactorMethod ?? undefined,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
      : []),
    ...(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET
      ? [LinkedIn({ clientId: process.env.LINKEDIN_CLIENT_ID, clientSecret: process.env.LINKEDIN_CLIENT_SECRET })]
      : []),
    ...(process.env.MICROSOFT_ENTRA_CLIENT_ID && process.env.MICROSOFT_ENTRA_CLIENT_SECRET
      ? [MicrosoftEntraId({
          clientId: process.env.MICROSOFT_ENTRA_CLIENT_ID,
          clientSecret: process.env.MICROSOFT_ENTRA_CLIENT_SECRET,
          issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_ENTRA_TENANT_ID ?? "common"}/v2.0`,
        })]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.isEmailVerified = true;
        token.twoFactorEnabled = (user as { twoFactorEnabled?: boolean }).twoFactorEnabled ?? false;
        token.twoFactorMethod = (user as { twoFactorMethod?: string }).twoFactorMethod ?? null;
        token.twoFactorVerified = !(token.twoFactorEnabled as boolean);
      }
      // Fetch role from DB on every sign-in (covers OAuth new users)
      if (account || user) {
        const dbUser = await db.user.findUnique({ where: { id: token.sub! } });
        token.role = dbUser?.role ?? "JOB_SEEKER";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isEmailVerified = (token.isEmailVerified as boolean) ?? true;
        session.user.twoFactorEnabled = (token.twoFactorEnabled as boolean) ?? false;
        session.user.twoFactorVerified = (token.twoFactorVerified as boolean) ?? true;
      }
      return session;
    },
  },
});
