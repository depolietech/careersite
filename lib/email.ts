import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = `"Equalhires" <${process.env.SMTP_FROM ?? "noreply@equalhires.com"}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function baseTemplate(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;max-width:600px;width:100%;">
          <tr>
            <td style="background:#1e3a2f;padding:28px 40px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">Equalhires</p>
              <p style="margin:4px 0 0;color:#a3c4b5;font-size:13px;">Skills-First Hiring</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                © ${new Date().getFullYear()} Equalhires. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendVerificationEmail(email: string, token: string, code?: string) {
  const url = `${APP_URL}/api/auth/verify-email?token=${token}`;
  const codeSection = code ? `
    <div style="margin:28px 0 0;padding-top:24px;border-top:1px solid #e2e8f0;">
      <p style="margin:0 0 12px;color:#475569;font-size:14px;">
        Or enter this <strong>6-digit code</strong> on the verification page (expires in <strong>15 minutes</strong>):
      </p>
      <div style="background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:12px;padding:20px;text-align:center;">
        <p style="margin:0;font-size:36px;font-weight:bold;letter-spacing:10px;color:#1e293b;font-family:monospace;">${code}</p>
      </div>
    </div>
  ` : "";

  const html = baseTemplate("Verify your email", `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:22px;">Verify your email address</h2>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;">
      Thanks for signing up! Click the button below to verify your email address. This link expires in <strong>24 hours</strong>.
    </p>
    <a href="${url}" style="display:inline-block;background:#1e3a2f;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;font-size:15px;">
      Verify my email
    </a>
    ${codeSection}
    <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;">
      If you did not create an account, you can safely ignore this email.
    </p>
  `);

  if (!process.env.SMTP_HOST) {
    console.log(`[EMAIL VERIFICATION] Verify link for ${email}: ${url}`);
    if (code) console.log(`[EMAIL VERIFICATION] Code for ${email}: ${code}`);
    return;
  }

  await createTransporter().sendMail({
    from: FROM,
    to: email,
    subject: "Verify your Equalhires account",
    html,
    text: `Verify your email: ${url}\n\nThis link expires in 24 hours.${code ? `\n\nOr enter this code on the verification page: ${code} (expires in 15 minutes)` : ""}`,
  });
}

export async function sendOtpEmail(email: string, code: string) {
  const html = baseTemplate("Your login code", `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:22px;">Your two-factor authentication code</h2>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;">
      Use the code below to complete your sign-in. It expires in <strong>10 minutes</strong>.
    </p>
    <div style="background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="margin:0;font-size:36px;font-weight:bold;letter-spacing:8px;color:#1e293b;font-family:monospace;">${code}</p>
    </div>
    <p style="margin:0;color:#94a3b8;font-size:13px;">
      If you did not request this code, please change your password immediately.
    </p>
  `);

  if (!process.env.SMTP_HOST) {
    console.log(`[2FA OTP] Code for ${email}: ${code}`);
    return;
  }

  await createTransporter().sendMail({
    from: FROM,
    to: email,
    subject: "Your Equalhires verification code",
    html,
    text: `Your verification code: ${code}\n\nExpires in 10 minutes.`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  const html = baseTemplate("Reset your password", `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:22px;">Reset your password</h2>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;">
      We received a request to reset your Equalhires password. Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
    </p>
    <a href="${url}" style="display:inline-block;background:#1e3a2f;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;font-size:15px;">
      Reset my password
    </a>
    <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;">
      If you did not request a password reset, you can safely ignore this email. Your password will not change.
    </p>
  `);

  if (!process.env.SMTP_HOST) {
    console.log(`[PASSWORD RESET] Reset link for ${email}: ${url}`);
    return;
  }

  await createTransporter().sendMail({
    from: FROM,
    to: email,
    subject: "Reset your Equalhires password",
    html,
    text: `Reset your password: ${url}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
  });
}

function escapeEmailText(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function sendVerificationApprovedEmail(email: string, companyName: string) {
  const html = baseTemplate("Your account has been approved", `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:22px;">Your recruiter account is approved!</h2>
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;">
      Great news — <strong>${escapeEmailText(companyName)}</strong> has been verified and approved on Equalhires.
      You can now sign in and post jobs.
    </p>
    <a href="${APP_URL}/login" style="display:inline-block;background:#1e3a2f;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;font-size:15px;">
      Sign in and start hiring
    </a>
    <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;">
      Once signed in, go to your dashboard to post your first job and review candidates.
    </p>
  `);

  if (!process.env.SMTP_HOST) {
    console.log(`[VERIFICATION APPROVED] Notification sent to ${email} for company: ${companyName}`);
    return;
  }

  await createTransporter().sendMail({
    from: FROM,
    to: email,
    subject: "Your Equalhires recruiter account is approved — you can now post jobs",
    html,
    text: `Your recruiter account for ${companyName} has been approved. Sign in at ${APP_URL}/login to start hiring.`,
  });
}

export async function sendPasswordChangedEmail(email: string) {
  const html = baseTemplate("Password changed", `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:22px;">Your password was changed</h2>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;">
      Your Equalhires account password was just changed. If you did not do this, please contact support immediately.
    </p>
    <a href="${APP_URL}/login" style="display:inline-block;background:#1e3a2f;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;font-size:15px;">
      Sign in to my account
    </a>
  `);

  if (!process.env.SMTP_HOST) {
    console.log(`[PASSWORD CHANGED] Notification sent to ${email}`);
    return;
  }

  await createTransporter().sendMail({
    from: FROM,
    to: email,
    subject: "Your Equalhires password was changed",
    html,
    text: "Your password was changed. If you did not do this, contact support.",
  });
}
