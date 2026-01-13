import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/groups/meetings - Create group meeting and record attendance
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { groupId, meetingDate, topic, notes, attendances } = await request.json()

        const meeting = await prisma.groupMeeting.create({
            data: {
                groupId,
                meetingDate: new Date(meetingDate),
                topic,
                notes,
            },
        })

        // Record attendances
        if (attendances && attendances.length > 0) {
            await Promise.all(
                attendances.map((att: any) =>
                    prisma.groupAttendance.create({
                        data: {
                            meetingId: meeting.id,
                            personId: att.personId,
                            status: att.status || 'PRESENT',
                            isGuest: att.isGuest || false,
                            notes: att.notes,
                        },
                    })
                )
            )
        }

        const meetingWithAttendances = await prisma.groupMeeting.findUnique({
            where: { id: meeting.id },
            include: {
                attendances: {
                    include: { person: true },
                },
            },
        })

        return NextResponse.json(meetingWithAttendances, { status: 201 })
    } catch (error) {
        console.error('Error creating group meeting:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
