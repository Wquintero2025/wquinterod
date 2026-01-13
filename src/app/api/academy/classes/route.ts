import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/academy/classes - List classes
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const courseId = searchParams.get('courseId')
        const campusId = searchParams.get('campusId')

        const where: any = { isActive: true }
        if (courseId) where.courseId = courseId
        if (campusId) where.campusId = campusId

        const classes = await prisma.courseClass.findMany({
            where,
            include: {
                course: true,
                campus: true,
                enrollments: {
                    include: { person: true },
                },
                sessions: {
                    orderBy: { sessionNumber: 'asc' },
                },
            },
            orderBy: { startDate: 'desc' },
        })

        return NextResponse.json(classes)
    } catch (error) {
        console.error('Error fetching classes:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/academy/classes - Create class
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        const courseClass = await prisma.courseClass.create({
            data,
            include: {
                course: true,
                campus: true,
            },
        })

        return NextResponse.json(courseClass, { status: 201 })
    } catch (error) {
        console.error('Error creating class:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
