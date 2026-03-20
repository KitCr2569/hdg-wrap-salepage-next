import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      hasMessengerLinked: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    hasMessengerLinked?: boolean;
  }
}
