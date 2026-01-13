import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/groups - List groups
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const campusId = searchParams.get('campusId')
        const groupType = searchParams.get('groupType')

        const where: any = {
            churchId: session.user.churchId,
            isActive: true,
        }

        if (campusId) where.campusId = campusId
        if (groupType) where.groupType = groupType

        const groups = await prisma.group.findMany({
            where,
            include: {
                campus: true,
                ministry: true,
                memberships: {
                    where: { isActive: true },
                    include: { person: true },
                },
                _count: {
                    select: { meetings: true },
                },
            },
            orderBy: { name: 'asc' },
        })

        return NextResponse.json(groups)
    } catch (error) {
        console.error('Error fetching groups:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/groups - Create group
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        const group = await prisma.group.create({
            data: {
                ...data,
                churchId: session.user.churchId,
            },
            include: {
                campus: true,
                ministry: true,
            },
        })

        return NextResponse.json(group, { status: 201 })
    } catch (error) {
        console.error('Error creating group:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
