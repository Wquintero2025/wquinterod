import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/events/attendance - Record event attendance
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { eventId, attendances } = await request.json()

        // Bulk create/update attendance records
        const results = await Promise.all(
            attendances.map((att: any) =>
                prisma.eventAttendance.upsert({
                    where: {
                        eventId_personId: {
                            eventId,
                            personId: att.personId,
                        },
                    },
                    create: {
                        eventId,
                        personId: att.personId,
                        status: att.status || 'PRESENT',
                        checkInAt: new Date(),
                        notes: att.notes,
                    },
                    update: {
                        status: att.status || 'PRESENT',
                        checkInAt: new Date(),
                        notes: att.notes,
                    },
                })
            )
        )

        // Create timeline entries for attendees
        await Promise.all(
            attendances.map((att: any) =>
                prisma.personTimeline.create({
                    data: {
                        personId: att.personId,
                        eventType: 'EVENT_ATTENDED',
                        title: 'Attended event',
                        description: `Attended event: ${eventId}`,
                    },
                })
            )
        )

        return NextResponse.json({ success: true, count: results.length })
    } catch (error) {
        console.error('Error recording event attendance:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
