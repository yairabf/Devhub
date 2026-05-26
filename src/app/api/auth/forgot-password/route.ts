import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const RESET_PREFIX = "reset:";
const TTL_MS = 24 * 60 * 60 * 1000;

const forgotPasswordSchema = z.object({
  email: z.email(),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = forgotPasswordSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Please enter a valid email." },
      { status: 400 },
    );
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user) {
    return NextResponse.json(
      { success: false, error: "No account found with that email." },
      { status: 404 },
    );
  }

  const identifier = RESET_PREFIX + normalizedEmail;
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TTL_MS);
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  try {
    await sendPasswordResetEmail(normalizedEmail, token);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to send reset email. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
