import nodemailer from "nodemailer";
import { escapeHtml, escapeHtmlAttribute, hasControlCharacters } from "@/lib/security";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function safeHeaderValue(value: string | undefined, fallback: string) {
  if (!value || hasControlCharacters(value)) return fallback;
  return value;
}

function getTransporter() {
  if (transporter) return transporter;

  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  transporter = nodemailer.createTransport({
    name: "namaste-express",
    host: safeHeaderValue(process.env.SMTP_HOST, "smtp.gmail.com"),
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    tls: { minVersion: "TLSv1.2" },
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  if (process.env.NODE_ENV === "test") {
    console.log(`[TEST] Email to ${to}: ${subject}`);
    return { messageId: "test-id" };
  }

  try {
    const safeTo = safeHeaderValue(to, "");
    if (!safeTo) throw new Error("Invalid recipient email");

    const info = await getTransporter().sendMail({
      from: safeHeaderValue(process.env.SMTP_FROM, "noreply@namastexpress.com"),
      to: safeTo,
      subject: safeHeaderValue(subject, "Notification"),
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export function verificationEmailTemplate(
  name: string,
  verifyUrl: string,
  lang: "ne" | "en" = "ne"
) {
  const safeName = escapeHtml(name);
  const safeVerifyUrl = escapeHtmlAttribute(verifyUrl);
  const content =
    lang === "ne"
      ? {
          title: "इमेल प्रमाणीकरण",
          greeting: `नमस्कार ${safeName},`,
          body: "तपाईंको इमेल ठेगाना प्रमाणित गर्न तलको बटनमा क्लिक गर्नुहोस्:",
          button: "इमेल प्रमाणित गर्नुहोस्",
          expiry: "यो लिंक २४ घण्टामा समाप्त हुनेछ।",
          footer: "यदि तपाईंले यो अनुरोध गर्नुभएको छैन भने, कृपया यो इमेल बेवास्ता गर्नुहोस्।",
        }
      : {
          title: "Email Verification",
          greeting: `Hello ${safeName},`,
          body: "Click the button below to verify your email address:",
          button: "Verify Email",
          expiry: "This link will expire in 24 hours.",
          footer: "If you did not request this, please ignore this email.",
        };

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Noto Sans Devanagari', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #c62828;">${content.title}</h2>
      <p>${content.greeting}</p>
      <p>${content.body}</p>
      <a href="${safeVerifyUrl}" style="display: inline-block; background: #c62828; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
        ${content.button}
      </a>
      <p style="color: #666; font-size: 14px;">${content.expiry}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">${content.footer}</p>
    </body>
    </html>
  `;
}

export function passwordResetEmailTemplate(
  name: string,
  resetUrl: string,
  lang: "ne" | "en" = "ne"
) {
  const safeName = escapeHtml(name);
  const safeResetUrl = escapeHtmlAttribute(resetUrl);
  const content =
    lang === "ne"
      ? {
          title: "पासवर्ड रिसेट",
          greeting: `नमस्कार ${safeName},`,
          body: "तपाईंको पासवर्ड रिसेट गर्न तलको बटनमा क्लिक गर्नुहोस्:",
          button: "पासवर्ड रिसेट गर्नुहोस्",
          expiry: "यो लिंक १ घण्टामा समाप्त हुनेछ।",
          footer: "यदि तपाईंले यो अनुरोध गर्नुभएको छैन भने, कृपया यो इमेल बेवास्ता गर्नुहोस्।",
        }
      : {
          title: "Password Reset",
          greeting: `Hello ${safeName},`,
          body: "Click the button below to reset your password:",
          button: "Reset Password",
          expiry: "This link will expire in 1 hour.",
          footer: "If you did not request this, please ignore this email.",
        };

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Noto Sans Devanagari', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #c62828;">${content.title}</h2>
      <p>${content.greeting}</p>
      <p>${content.body}</p>
      <a href="${safeResetUrl}" style="display: inline-block; background: #c62828; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
        ${content.button}
      </a>
      <p style="color: #666; font-size: 14px;">${content.expiry}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">${content.footer}</p>
    </body>
    </html>
  `;
}

export function welcomeEmailTemplate(
  name: string,
  lang: "ne" | "en" = "ne"
) {
  const safeName = escapeHtml(name);
  const content =
    lang === "ne"
      ? {
          title: "स्वागत छ!",
          greeting: `नमस्कार ${safeName},`,
          body: "समाचार पोर्टलमा तपाईंको स्वागत छ। अब तपाईं समाचार पढ्न, टिप्पणी गर्न र बुकमार्क गर्न सक्नुहुन्छ।",
          footer: "समाचार पोर्टल टोली",
        }
      : {
          title: "Welcome!",
          greeting: `Hello ${safeName},`,
          body: "Welcome to News Portal. You can now read articles, post comments, and bookmark your favorites.",
          footer: "News Portal Team",
        };

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Noto Sans Devanagari', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #c62828;">${content.title}</h2>
      <p>${content.greeting}</p>
      <p>${content.body}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">${content.footer}</p>
    </body>
    </html>
  `;
}
