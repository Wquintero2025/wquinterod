import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/persons/[id] - Get person details with timeline
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const person = await prisma.person.findFirst({
            where: {
                id: params.id,
                churchId: session.user.churchId,
            },
            include: {
                campus: true,
                roles: {
                    where: { isActive: true },
                    include: { role: true },
                },
                timeline: {
                    orderBy: { occurredAt: 'desc' },
                    take: 100,
                },
                altarCallEvents: {
                    include: { event: true },
                    orderBy: { createdAt: 'desc' },
                },
                enrollments: {
                    include: {
                        class: {
                            include: { course: true },
                        },
                    },
                },
                groupMemberships: {
                    where: { isActive: true },
                    include: { group: true },
                },
                careCases: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        })

        if (!person) {
            return NextResponse.json({ error: 'Person not found' }, { status: 404 })
        }

        return NextResponse.json(person)
    } catch (error) {
        console.error('Error fetching person:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH /api/persons/[id] - Update person
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        const person = await prisma.person.update({
            where: {
                id: params.id,
                churchId: session.user.churchId,
            },
            data,
            include: {
                campus: true,
            },
        })

        return NextResponse.json(person)
    } catch (error) {
        console.error('Error updating person:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
