import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      isEmailVerified: boolean;
      twoFactorEnabled: boolean;
      twoFactorVerified: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    role: string;
    isEmailVerified?: boolean;
    twoFactorEnabled?: boolean;
    twoFactorMethod?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    isEmailVerified?: boolean;
    twoFactorEnabled?: boolean;
    twoFactorMethod?: string | null;
    twoFactorVerified?: boolean;
  }
}
