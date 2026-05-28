import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const TTL_MS = 24 * 60 * 60 * 1000;

const resendSchema = z.object({
  email: z.email(),
});

export async function POST(request: Request) {
  if (process.env.EMAIL_VERIFICATION_ENABLED !== "true") {
    return NextResponse.json(
      { success: false, error: "Email verification is not enabled." },
      { status: 400 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = resendSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Please enter a valid email." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();

  const limit = await rateLimit("resendVerification", `${getClientIp(request)}:${email}`);
  if (!limit.success) {
    return rateLimitResponse(limit.retryAfterSeconds);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { success: false, error: "No account found with that email." },
      { status: 404 },
    );
  }
  if (user.emailVerified) {
    return NextResponse.json(
      { success: false, error: "Your email is already verified." },
      { status: 400 },
    );
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TTL_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  try {
    await sendVerificationEmail(email, token);
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send verification email. Please try again.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
