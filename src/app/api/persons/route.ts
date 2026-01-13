import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/persons - List persons with filters
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')
        const campusId = searchParams.get('campusId')
        const spiritualStatus = searchParams.get('spiritualStatus')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const skip = (page - 1) * limit

        const where: any = {
            churchId: session.user.churchId,
            isActive: true,
        }

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ]
        }

        if (campusId) {
            where.campusId = campusId
        }

        if (spiritualStatus) {
            where.spiritualStatus = spiritualStatus
        }

        const [persons, total] = await Promise.all([
            prisma.person.findMany({
                where,
                include: {
                    campus: true,
                    roles: {
                        where: { isActive: true },
                        include: { role: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.person.count({ where }),
        ])

        return NextResponse.json({
            persons,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching persons:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/persons - Create a new person
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        const person = await prisma.person.create({
            data: {
                ...data,
                churchId: session.user.churchId,
            },
            include: {
                campus: true,
            },
        })

        // Create timeline entry
        await prisma.personTimeline.create({
            data: {
                personId: person.id,
                eventType: 'FIRST_VISIT',
                title: 'Person created',
                description: `${person.firstName} ${person.lastName} was added to the system`,
            },
        })

        return NextResponse.json(person, { status: 201 })
    } catch (error) {
        console.error('Error creating person:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
