import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { findDuplicates } from '@/lib/duplicate-detection'

// POST /api/altar-calls - Create altar call event with duplicate detection
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const { personData, eventId, decisionType, invitedBy, counselor, notes, skipDuplicateCheck } = data

        // Check for duplicates unless explicitly skipped
        if (!skipDuplicateCheck) {
            const duplicates = await findDuplicates(session.user.churchId, personData)

            if (duplicates.length > 0) {
                // Return duplicates for manual review
                return NextResponse.json({
                    requiresReview: true,
                    duplicates: duplicates.map(d => ({
                        ...d.person,
                        confidenceScore: d.confidenceScore,
                        matchReasons: d.matchReasons,
                    })),
                })
            }
        }

        // Create or use existing person
        let personId = data.existingPersonId

        if (!personId) {
            const person = await prisma.person.create({
                data: {
                    ...personData,
                    churchId: session.user.churchId,
                    spiritualStatus: decisionType === 'SALVATION' ? 'NEW_BELIEVER' : personData.spiritualStatus || 'VISITOR',
                    firstVisitDate: personData.firstVisitDate || new Date(),
                    salvationDate: decisionType === 'SALVATION' ? new Date() : personData.salvationDate,
                },
            })
            personId = person.id

            // Create timeline entry
            await prisma.personTimeline.create({
                data: {
                    personId: person.id,
                    eventType: 'FIRST_VISIT',
                    title: 'First visit recorded',
                    description: `${person.firstName} ${person.lastName} visited for the first time`,
                },
            })
        }

        // Create altar call event
        const altarCallEvent = await prisma.altarCallEvent.create({
            data: {
                churchId: session.user.churchId,
                campusId: personData.campusId,
                personId,
                eventId,
                decisionType,
                invitedBy,
                counselor,
                notes,
            },
            include: {
                person: true,
                event: true,
            },
        })

        // Create timeline entry for altar call
        await prisma.personTimeline.create({
            data: {
                personId,
                eventType: 'ALTAR_CALL',
                title: `Altar call: ${decisionType}`,
                description: notes || `Made a decision for ${decisionType}`,
            },
        })

        // Create follow-up tasks
        const followUpTasks = []

        // Task 1: Welcome call within 24 hours
        followUpTasks.push(
            prisma.followUpTask.create({
                data: {
                    altarCallEventId: altarCallEvent.id,
                    title: 'Welcome call',
                    description: 'Make a welcome call to the new visitor',
                    createdById: session.user.personId,
                    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                    status: 'PENDING',
                },
            })
        )

        // Task 2: Send welcome message
        followUpTasks.push(
            prisma.followUpTask.create({
                data: {
                    altarCallEventId: altarCallEvent.id,
                    title: 'Send welcome message',
                    description: 'Send welcome email/SMS with next steps',
                    createdById: session.user.personId,
                    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
                    status: 'PENDING',
                },
            })
        )

        // Task 3: Schedule follow-up meeting
        if (decisionType === 'SALVATION' || decisionType === 'COUNSELING') {
            followUpTasks.push(
                prisma.followUpTask.create({
                    data: {
                        altarCallEventId: altarCallEvent.id,
                        title: 'Schedule follow-up meeting',
                        description: 'Schedule a one-on-one meeting for discipleship or counseling',
                        createdById: session.user.personId,
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                        status: 'PENDING',
                    },
                })
            )
        }

        await Promise.all(followUpTasks)

        return NextResponse.json({
            success: true,
            altarCallEvent,
            message: 'Altar call event created successfully',
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating altar call:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// GET /api/altar-calls - List altar call events
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const campusId = searchParams.get('campusId')
        const decisionType = searchParams.get('decisionType')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const skip = (page - 1) * limit

        const where: any = {
            churchId: session.user.churchId,
        }

        if (campusId) where.campusId = campusId
        if (decisionType) where.decisionType = decisionType

        const [events, total] = await Promise.all([
            prisma.altarCallEvent.findMany({
                where,
                include: {
                    person: true,
                    campus: true,
                    event: true,
                    followUpTasks: {
                        where: { status: { not: 'COMPLETED' } },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.altarCallEvent.count({ where }),
        ])

        return NextResponse.json({
            events,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching altar calls:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
