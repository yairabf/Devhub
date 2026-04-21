import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/sign-in?verify_error=invalid");
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) {
    redirect("/sign-in?verify_error=invalid");
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    redirect("/sign-in?verify_error=expired");
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({ where: { token } });

  redirect("/sign-in?verified=1");
}
