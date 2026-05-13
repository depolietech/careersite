import nodemailer from "nodemailer";

const FROM_ADDRESS = process.env.SMTP_FROM ?? "noreply@equalhires.com";
const FROM = `"Equalhires" <${FROM_ADDRESS}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function sendEmail(to: string, subject: string, html: string, text: string) {
  // Preferred: Resend HTTP API — avoids SMTP auth issues entirely
  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html, text }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Resend API error ${res.status}: ${errBody}`);
    }
    return;
  }

  // Fallback: SMTP via nodemailer
  if (process.env.SMTP_HOST) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({ from: FROM, to, subject, html, text });
    return;
  }

  // Dev: print to console
  console.log(`\n[EMAIL] To: ${to}\nSubject: ${subject}\n${text}\n`);
}

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

  await sendEmail(
    email,
    "Verify your Equalhires account",
    html,
    `Verify your email: ${url}\n\nThis link expires in 24 hours.${code ? `\n\nOr enter this code: ${code} (expires in 15 minutes)` : ""}`
  );
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

  await sendEmail(email, "Your Equalhires verification code", html, `Your verification code: ${code}\n\nExpires in 10 minutes.`);
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

  await sendEmail(email, "Reset your Equalhires password", html, `Reset your password: ${url}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`);
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

  await sendEmail(email, "Your Equalhires recruiter account is approved — you can now post jobs", html, `Your recruiter account for ${companyName} has been approved. Sign in at ${APP_URL}/login to start hiring.`);
}

export async function sendAdminAccountRequestEmail(
  adminEmail: string,
  userEmail: string,
  requestType: "restore" | "new_account" | "contact"
) {
  const labels = {
    restore:     "Account Reinstatement Request",
    new_account: "New Account Request (after data purge)",
    contact:     "Support Contact from Deleted Account",
  };
  const bodies = {
    restore:     `<strong>${escapeEmailText(userEmail)}</strong> is requesting to reinstate their deleted Equalhires account. Their profile, applications and history would be restored upon approval.`,
    new_account: `<strong>${escapeEmailText(userEmail)}</strong> wants to permanently delete their old account data and start fresh with a new account. They cannot register until you approve this request.`,
    contact:     `<strong>${escapeEmailText(userEmail)}</strong> contacted support about their deleted Equalhires account and is requesting manual review.`,
  };
  const label = labels[requestType];
  const body  = bodies[requestType];

  const html = baseTemplate(`Admin: ${label}`, `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:22px;">${label}</h2>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;">${body}</p>
    <a href="${APP_URL}/admin/account-requests" style="display:inline-block;background:#1e3a2f;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;font-size:15px;">
      Review in Admin Panel
    </a>
    <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;">
      Go to Admin Panel → Account Requests to approve or reject this request.
    </p>
  `);

  await sendEmail(
    adminEmail,
    `[Equalhires Admin] ${label} — ${userEmail}`,
    html,
    `${label}\n\nUser: ${userEmail}\n\nReview at ${APP_URL}/admin/account-requests`
  );
}

export async function sendNewAccountApprovedEmail(email: string) {
  const html = baseTemplate("You can now create a new account", `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:22px;">Your request has been approved</h2>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;">
      An Equalhires administrator has reviewed your request. Your previous account data has been cleared and you can now register a new account using this email address.
    </p>
    <a href="${APP_URL}/register" style="display:inline-block;background:#1e3a2f;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;font-size:15px;">
      Create my new account
    </a>
    <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;">
      If you did not request this, please contact support.
    </p>
  `);

  await sendEmail(
    email,
    "You can now create a new Equalhires account",
    html,
    `Your request has been approved. You can now register a new account at ${APP_URL}/register`
  );
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

  await sendEmail(email, "Your Equalhires password was changed", html, "Your password was changed. If you did not do this, contact support.");
}

export async function sendApplicationSubmittedEmail(email: string, jobTitle: string) {
  const html = baseTemplate("Application submitted", `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:22px;">Application submitted successfully</h2>
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;">
      Your application for <strong>${escapeEmailText(jobTitle)}</strong> has been submitted.
      Your identity is masked — the recruiter can only see your skills, experience, and education until an interview is scheduled.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#475569;">✅ Skills shared with recruiter</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#475569;">✅ Experience shared (dates masked)</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#475569;">✅ Education shared (institution masked)</td></tr>
      <tr><td style="padding:8px 0;font-size:14px;color:#475569;">🔒 Name, photo &amp; contact details hidden</td></tr>
    </table>
    <a href="${APP_URL}/dashboard" style="display:inline-block;background:#1e3a2f;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;font-size:15px;">
      View my applications
    </a>
    <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;">
      You will be notified if the recruiter schedules an interview.
    </p>
  `);

  await sendEmail(
    email,
    `Application submitted — ${jobTitle}`,
    html,
    `Your application for "${jobTitle}" was submitted. Your identity is masked until an interview is scheduled. View your applications at ${APP_URL}/dashboard`
  );
}

export async function sendInterviewScheduledEmail(
  email: string,
  jobTitle: string,
  scheduledAt: Date,
  interviewType: string,
  meetingLink: string | null
) {
  const dateStr = scheduledAt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const timeStr = scheduledAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  const typeLabel = interviewType === "video" ? "Video Call" : interviewType === "phone" ? "Phone Call" : "In Person";
  const meetingSection = meetingLink
    ? `<p style="margin:16px 0 0;"><a href="${escapeEmailText(meetingLink)}" style="display:inline-block;background:#1e3a2f;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:14px;">Join Meeting</a></p>`
    : "";

  const html = baseTemplate("Interview scheduled", `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:22px;">Interview scheduled</h2>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;">
      A recruiter has scheduled an interview for the <strong>${escapeEmailText(jobTitle)}</strong> position.
    </p>
    <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:14px;color:#475569;"><strong>Date:</strong> ${dateStr}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#475569;"><strong>Time:</strong> ${timeStr}</p>
      <p style="margin:0;font-size:14px;color:#475569;"><strong>Type:</strong> ${typeLabel}</p>
    </div>
    <p style="margin:0 0 8px;color:#475569;font-size:14px;">
      Your full identity will be revealed to the recruiter once you accept the interview.
    </p>
    ${meetingSection}
    <p style="margin:24px 0 0;"><a href="${APP_URL}/calendar" style="display:inline-block;background:#1e3a2f;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;font-size:15px;">View in Calendar</a></p>
  `);

  await sendEmail(
    email,
    `Interview scheduled — ${jobTitle}`,
    html,
    `Interview scheduled for "${jobTitle}" on ${dateStr} at ${timeStr} (${typeLabel}). View at ${APP_URL}/calendar`
  );
}

export async function send2FAChangedEmail(email: string, action: "enabled" | "disabled") {
  const title = action === "enabled" ? "Two-factor authentication enabled" : "Two-factor authentication disabled";
  const body = action === "enabled"
    ? "Two-factor authentication has been <strong>enabled</strong> on your Equalhires account. Your account is now more secure."
    : "Two-factor authentication has been <strong>disabled</strong> on your Equalhires account. If you did not do this, please secure your account immediately.";

  const html = baseTemplate(title, `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:22px;">${title}</h2>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;">${body}</p>
    <a href="${APP_URL}/settings" style="display:inline-block;background:#1e3a2f;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;font-size:15px;">
      Go to Security Settings
    </a>
    <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;">
      If you did not make this change, contact support immediately.
    </p>
  `);

  await sendEmail(email, `[Equalhires Security] ${title}`, html, `${title}. If you did not do this, contact support.`);
}
