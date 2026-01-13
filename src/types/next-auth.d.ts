import 'next-auth'

declare module 'next-auth' {
    interface User {
        role: string
        churchId: string
        churchName: string
        personId: string
    }

    interface Session {
        user: {
            id: string
            email: string
            name: string
            role: string
            churchId: string
            churchName: string
            personId: string
        }
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role: string
        churchId: string
        churchName: string
        personId: string
    }
}
