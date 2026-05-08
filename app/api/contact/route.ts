import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

async function sendContactEmail(to: string, subject: string, html: string, text: string, replyTo: string) {
  const from = `"Equalhires Contact" <${process.env.SMTP_FROM ?? "noreply@equalhires.com"}>`;

  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, text, reply_to: replyTo }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Resend API error ${res.status}: ${errBody}`);
    }
    return;
  }

  if (process.env.SMTP_HOST) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({ from, to, replyTo, subject, html, text });
    return;
  }

  console.log(`[CONTACT] From: ${replyTo}\nSubject: ${subject}\n${text}`);
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, topic, message } = await req.json();

    if (!name || !email || !topic || !message) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (typeof name !== "string" || name.length > 100) {
      return NextResponse.json({ error: "Name must be under 100 characters." }, { status: 400 });
    }
    if (typeof email !== "string" || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (typeof topic !== "string" || topic.length > 100) {
      return NextResponse.json({ error: "Topic must be under 100 characters." }, { status: 400 });
    }
    if (typeof message !== "string" || message.length > 5000) {
      return NextResponse.json({ error: "Message must be under 5000 characters." }, { status: 400 });
    }

    const safeName    = escapeHtml(name);
    const safeEmail   = escapeHtml(email);
    const safeTopic   = escapeHtml(topic);
    const safeMessage = escapeHtml(message);

    const adminEmail = process.env.ADMIN_CONTACT_EMAIL ?? "info@equalhires.com";

    await sendContactEmail(
      adminEmail,
      `[${safeTopic}] New message from ${safeName}`,
      `<p><strong>Name:</strong> ${safeName}</p>
       <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
       <p><strong>Topic:</strong> ${safeTopic}</p>
       <hr />
       <p style="white-space:pre-wrap">${safeMessage}</p>`,
      `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`,
      email
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact email failed:", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
