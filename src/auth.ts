import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import authConfig from "./auth.config";
import { prisma } from "@/lib/prisma";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  providers: authConfig.providers.map((provider) => {
    if (
      typeof provider === "object" &&
      "id" in provider &&
      provider.id === "credentials"
    ) {
      return Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        authorize: async (credentials) => {
          const parsed = credentialsSchema.safeParse(credentials);
          if (!parsed.success) return null;

          const { email, password } = parsed.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.password) return null;

          const valid = await bcrypt.compare(password, user.password);
          if (!valid) return null;

          if (!user.emailVerified) throw new EmailNotVerifiedError();

          return { id: user.id, email: user.email, name: user.name };
        },
      });
    }
    return provider;
  }),
});
