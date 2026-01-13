import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
                churchId: { label: 'Church ID', type: 'text' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password required')
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: {
                        person: {
                            include: {
                                church: true,
                                campus: true,
                            },
                        },
                        church: true,
                    },
                })

                if (!user || !user.isActive) {
                    throw new Error('Invalid credentials')
                }

                const isPasswordValid = await compare(credentials.password, user.passwordHash)

                if (!isPasswordValid) {
                    throw new Error('Invalid credentials')
                }

                // Update last login
                await prisma.user.update({
                    where: { id: user.id },
                    data: { lastLoginAt: new Date() },
                })

                return {
                    id: user.id,
                    email: user.email,
                    name: `${user.person.firstName} ${user.person.lastName}`,
                    role: user.role,
                    churchId: user.churchId,
                    churchName: user.church.name,
                    personId: user.personId,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.churchId = user.churchId
                token.churchName = user.churchName
                token.personId = user.personId
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub!
                session.user.role = token.role as string
                session.user.churchId = token.churchId as string
                session.user.churchName = token.churchName as string
                session.user.personId = token.personId as string
            }
            return session
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
}
