import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Determina a URL base da aplicação
const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

const baseUrl = getBaseUrl()

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const db = getDb()
        if (!db) {
          console.error('Banco de dados não configurado')
          return null
        }

        try {
          // Buscar usuário por email
          const users = await db`
            SELECT id, email, name, password, image
            FROM users
            WHERE email = ${credentials.email}
          `

          if (!users || users.length === 0) {
            return null
          }

          const user = users[0]

          // Verificar se o usuário tem senha (não é usuário do Google)
          if (!user.password) {
            return null
          }

          // Verificar senha
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isValidPassword) {
            return null
          }

          // Retornar objeto do usuário
          return {
            id: user.id,
            email: user.email,
            name: user.name || null,
            image: user.image || null,
          }
        } catch (error: any) {
          console.error('Erro ao autenticar usuário:', error)
          // Log mais detalhado para debug
          if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
            console.error('Erro de conexão com banco de dados. Verifique DATABASE_URL.')
          }
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          redirect_uri: `${baseUrl}/api/auth/callback/google`,
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

