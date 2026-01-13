import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/events - List events
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const campusId = searchParams.get('campusId')
        const eventType = searchParams.get('eventType')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const where: any = {
            churchId: session.user.churchId,
            isActive: true,
        }

        if (campusId) where.campusId = campusId
        if (eventType) where.eventType = eventType
        if (startDate || endDate) {
            where.startDateTime = {}
            if (startDate) where.startDateTime.gte = new Date(startDate)
            if (endDate) where.startDateTime.lte = new Date(endDate)
        }

        const events = await prisma.event.findMany({
            where,
            include: {
                campus: true,
                _count: {
                    select: {
                        registrations: true,
                        attendances: true,
                    },
                },
            },
            orderBy: { startDateTime: 'asc' },
        })

        return NextResponse.json(events)
    } catch (error) {
        console.error('Error fetching events:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/events - Create event
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        const event = await prisma.event.create({
            data: {
                ...data,
                churchId: session.user.churchId,
                startDateTime: new Date(data.startDateTime),
                endDateTime: new Date(data.endDateTime),
            },
            include: {
                campus: true,
            },
        })

        return NextResponse.json(event, { status: 201 })
    } catch (error) {
        console.error('Error creating event:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
