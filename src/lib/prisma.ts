import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Multi-tenant middleware to automatically filter by churchId
// This will be applied in API routes using getServerSession to get the churchId
export async function withTenant<T>(
    churchId: string,
    callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
    // Create a new Prisma client instance with middleware for this request
    const prismaWithMiddleware = new PrismaClient()

    // Add middleware to automatically add churchId filter
    prismaWithMiddleware.$use(async (params, next) => {
        // Models that should be filtered by churchId
        const tenantModels = [
            'Church', 'Campus', 'Person', 'User', 'Role', 'LeadershipPosition',
            'Ministry', 'Course', 'Group', 'Event', 'CareCase', 'AltarCallEvent'
        ]

        if (tenantModels.includes(params.model || '')) {
            if (params.action === 'findMany' || params.action === 'findFirst' || params.action === 'findUnique') {
                params.args = params.args || {}
                params.args.where = params.args.where || {}

                if (params.model !== 'Church') {
                    params.args.where.churchId = churchId
                } else if (params.action !== 'findUnique') {
                    params.args.where.id = churchId
                }
            } else if (params.action === 'create' || params.action === 'createMany') {
                params.args = params.args || {}
                if (params.model !== 'Church') {
                    if (params.action === 'create') {
                        params.args.data = params.args.data || {}
                        params.args.data.churchId = churchId
                    }
                }
            }
        }

        return next(params)
    })

    try {
        return await callback(prismaWithMiddleware)
    } finally {
        await prismaWithMiddleware.$disconnect()
    }
}
