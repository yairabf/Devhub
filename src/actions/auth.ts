"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const RESET_PREFIX = "reset:";
const TTL_MS = 24 * 60 * 60 * 1000;

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export async function forgotPassword(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    return { success: false, error: "No account found with that email." };
  }

  const identifier = RESET_PREFIX + normalizedEmail;
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TTL_MS);
  await prisma.verificationToken.create({ data: { identifier, token, expires } });

  try {
    await sendPasswordResetEmail(normalizedEmail, token);
  } catch {
    return { success: false, error: "Failed to send reset email. Please try again." };
  }

  return { success: true };
}

export async function resetPassword(
  token: string,
  password: string,
  confirmPassword: string,
): Promise<{ success: boolean; error?: string }> {
  const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || !record.identifier.startsWith(RESET_PREFIX)) {
    return { success: false, error: "Invalid or expired reset link." };
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return { success: false, error: "This reset link has expired. Please request a new one." };
  }

  const email = record.identifier.slice(RESET_PREFIX.length);
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.update({ where: { email }, data: { password: passwordHash } });
  await prisma.verificationToken.delete({ where: { token } });

  return { success: true };
}
