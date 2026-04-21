import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const APP_URL = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your DevStash email",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;font-weight:600;margin-bottom:8px">Verify your email</h1>
        <p style="color:#666;margin-bottom:24px">
          Click the button below to verify your email address. This link expires in 24 hours.
        </p>
        <a href="${verifyUrl}"
           style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500">
          Verify email
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px">
          If you didn't create a DevStash account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
