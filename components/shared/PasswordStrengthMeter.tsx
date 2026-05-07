"use client";
import { checkPassword } from "@/lib/password";

const STRENGTH_COLORS = {
  weak:   ["bg-red-500",    "bg-gray-200", "bg-gray-200", "bg-gray-200"],
  fair:   ["bg-orange-400", "bg-orange-400", "bg-gray-200", "bg-gray-200"],
  good:   ["bg-yellow-400", "bg-yellow-400", "bg-yellow-400", "bg-gray-200"],
  strong: ["bg-green-500",  "bg-green-500",  "bg-green-500",  "bg-green-500"],
};

const STRENGTH_LABELS = {
  weak:   "Weak",
  fair:   "Fair",
  good:   "Good",
  strong: "Strong",
};

const STRENGTH_TEXT_COLORS = {
  weak:   "text-red-600",
  fair:   "text-orange-500",
  good:   "text-yellow-600",
  strong: "text-green-600",
};

interface Props {
  password: string;
  className?: string;
}

export function PasswordStrengthMeter({ password, className = "" }: Props) {
  if (!password) return null;

  const { strength, errors } = checkPassword(password);
  const bars = STRENGTH_COLORS[strength];

  return (
    <div className={`space-y-2 ${className}`} role="status" aria-live="polite">
      {/* Bars */}
      <div className="flex gap-1" aria-hidden="true">
        {bars.map((color, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${color}`}
          />
        ))}
      </div>

      {/* Label */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Password strength</p>
        <p className={`text-xs font-semibold ${STRENGTH_TEXT_COLORS[strength]}`}>
          {STRENGTH_LABELS[strength]}
        </p>
      </div>

      {/* Unmet rules */}
      {errors.length > 0 && (
        <ul className="text-xs text-gray-500 space-y-0.5">
          {errors.map((err) => (
            <li key={err} className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-gray-400 shrink-0" aria-hidden="true" />
              {err}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
