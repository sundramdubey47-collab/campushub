import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!passwordMatch) return null

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
    Google,
  ],
  session: { strategy: "jwt" },
  callbacks: {
  signIn: async ({ user, account }) => {
    if (account?.provider === "google") {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      })

      if (!existingUser) {
        await prisma.user.create({
          data: {
            name: user.name ?? "No Name",
            email: user.email!,
            passwordHash: "",
            role: "STUDENT",
          },
        })
      }
    }
    return true
  },
  jwt: async ({ token, user }) => {
    if (user) {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
      })
      if (dbUser) {
        token.role = dbUser.role
        token.id = dbUser.id.toString()
      }
    }
    return token
  },
  session: async ({ session, token }) => {
    if (session.user) {
      session.user.id = token.id as string
      session.user.role = token.role as string
    }
    return session
  },
},
  pages: {
    signIn: "/login",
  },
})