import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: { departamento: true },
        });

        if (!usuario) return null;

        const passwordValida = await bcrypt.compare(credentials.password, usuario.password);
        if (!passwordValida) return null;

        return {
          id: String(usuario.id),
          email: usuario.email,
          name: usuario.nombre,
          role: usuario.role,
          departamentoId: usuario.departamentoId ? String(usuario.departamentoId) : null,
          departamentoNombre: usuario.departamento?.nombre ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.departamentoId = (user as any).departamentoId;
        token.departamentoNombre = (user as any).departamentoNombre;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).departamentoId = token.departamentoId;
        (session.user as any).departamentoNombre = token.departamentoNombre;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
