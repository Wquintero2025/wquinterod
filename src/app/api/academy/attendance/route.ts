import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/academy/attendance - Record session attendance
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { sessionId, attendances } = await request.json()

        // Bulk create/update attendance records
        const results = await Promise.all(
            attendances.map((att: any) =>
                prisma.sessionAttendance.upsert({
                    where: {
                        sessionId_personId: {
                            sessionId,
                            personId: att.personId,
                        },
                    },
                    create: {
                        sessionId,
                        personId: att.personId,
                        status: att.status,
                        notes: att.notes,
                    },
                    update: {
                        status: att.status,
                        notes: att.notes,
                    },
                })
            )
        )

        return NextResponse.json({ success: true, count: results.length })
    } catch (error) {
        console.error('Error recording attendance:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
