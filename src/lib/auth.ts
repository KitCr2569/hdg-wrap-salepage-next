import { NextAuthOptions } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    FacebookProvider({
      clientId: process.env.FB_CLIENT_ID || "NO-CLIENT-ID",
      clientSecret: process.env.FB_CLIENT_SECRET || "NO-SECRET",
      // Strictly for Authentication (App A)
      authorization: { params: { scope: "public_profile,email" } },
    }),
  ],
  callbacks: {
        async signIn({ user, profile }: any) {
      if (user.email) {
        // Upsert user into SQLite (Prisma)
        try {
          await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name || "",
              facebookId: profile?.id as string,
            },
            create: {
              email: user.email,
              name: user.name || "",
              facebookId: profile?.id as string,
            },
          });
          return true;
        } catch (e) {
          console.error("Error saving user:", e);
          return false;
        }
      }
      return false;
    },
    async session({ session }) {
      if (session?.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
        if (dbUser) {
          // Attach internal ID and messaging connection status
          session.user = {
            ...session.user,
            id: dbUser.id,
            hasMessengerLinked: !!dbUser.psid,
          } as any;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret",
};
