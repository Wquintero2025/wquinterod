import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/academy/enrollments - Enroll person in class
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { classId, personId } = await request.json()

        const enrollment = await prisma.enrollment.create({
            data: {
                classId,
                personId,
                status: 'ENROLLED',
            },
            include: {
                person: true,
                class: {
                    include: { course: true },
                },
            },
        })

        // Create timeline entry
        await prisma.personTimeline.create({
            data: {
                personId,
                eventType: 'COURSE_ENROLLED',
                title: `Enrolled in ${enrollment.class.course.name}`,
                description: `Enrolled in class: ${enrollment.class.name}`,
            },
        })

        return NextResponse.json(enrollment, { status: 201 })
    } catch (error) {
        console.error('Error creating enrollment:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
