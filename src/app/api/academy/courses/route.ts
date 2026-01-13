import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/academy/courses - List courses
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const courses = await prisma.course.findMany({
            where: {
                churchId: session.user.churchId,
                isActive: true,
            },
            include: {
                classes: {
                    where: { isActive: true },
                    include: {
                        campus: true,
                        _count: {
                            select: { enrollments: true },
                        },
                    },
                },
            },
            orderBy: { level: 'asc' },
        })

        return NextResponse.json(courses)
    } catch (error) {
        console.error('Error fetching courses:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/academy/courses - Create course
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        const course = await prisma.course.create({
            data: {
                ...data,
                churchId: session.user.churchId,
            },
        })

        return NextResponse.json(course, { status: 201 })
    } catch (error) {
        console.error('Error creating course:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
