import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PASSWORD_RESET_TOKEN_PREFIX } from "@/lib/constants";

const deleteAccountSchema = z.object({
  confirm: z.string().min(1, "Confirmation is required"),
});

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
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

  const parsed = deleteAccountSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Confirmation is required" },
      { status: 400 },
    );
  }

  const sessionEmail = session.user.email.trim().toLowerCase();
  if (parsed.data.confirm.trim().toLowerCase() !== sessionEmail) {
    return NextResponse.json(
      {
        success: false,
        error: "Confirmation does not match your email.",
      },
      { status: 400 },
    );
  }

  // Remove any password-reset tokens issued for this email (not FK-linked).
  await prisma.verificationToken.deleteMany({
    where: {
      OR: [
        { identifier: sessionEmail },
        { identifier: PASSWORD_RESET_TOKEN_PREFIX + sessionEmail },
      ],
    },
  });

  // User has onDelete: Cascade to Items, Collections, Sessions, Accounts,
  // ItemTypes — Prisma handles the rest.
  await prisma.user.delete({ where: { id: session.user.id } });

  return NextResponse.json({ success: true }, { status: 200 });
}
