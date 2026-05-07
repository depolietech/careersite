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

    if (!process.env.SMTP_HOST) {
      console.log(`[CONTACT] From: ${email} | Topic: ${topic}\n${message}`);
      return NextResponse.json({ ok: true });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Equalhires Contact" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      replyTo: email,
      subject: `[${safeTopic}] New message from ${safeName}`,
      text: `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`,
      html: `
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
        <p><strong>Topic:</strong> ${safeTopic}</p>
        <hr />
        <p style="white-space:pre-wrap">${safeMessage}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact email failed:", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
