export interface PasswordCheckResult {
  valid: boolean;
  errors: string[];
  strength: "weak" | "fair" | "good" | "strong";
  score: number; // 0-4
}

const RULES = [
  { test: (p: string) => p.length >= 8,                       msg: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p),                    msg: "At least one uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p),                    msg: "At least one lowercase letter" },
  { test: (p: string) => /[0-9]/.test(p),                    msg: "At least one number" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p),             msg: "At least one special character" },
];

export function checkPassword(password: string): PasswordCheckResult {
  const errors = RULES.filter((r) => !r.test(password)).map((r) => r.msg);
  const score = RULES.length - errors.length; // 0-5 → map to 0-4
  const normalizedScore = Math.min(4, score > 0 ? score - 1 : 0);

  const strength: PasswordCheckResult["strength"] =
    score <= 1 ? "weak" :
    score === 2 ? "fair" :
    score === 3 ? "good" :
    "strong";

  return { valid: errors.length === 0, errors, strength, score: normalizedScore };
}

export function validatePasswordOrThrow(password: string): void {
  const { valid, errors } = checkPassword(password);
  if (!valid) throw new Error(errors[0]);
}
