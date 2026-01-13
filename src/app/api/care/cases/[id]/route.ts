import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/care/cases/[id] - Get case details
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const careCase = await prisma.careCase.findFirst({
            where: {
                id: params.id,
                churchId: session.user.churchId,
            },
            include: {
                person: true,
                assignments: {
                    include: { counselor: true },
                    orderBy: { assignedAt: 'desc' },
                },
                notes: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        })

        if (!careCase) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 })
        }

        return NextResponse.json(careCase)
    } catch (error) {
        console.error('Error fetching care case:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/care/cases/[id]/notes - Add note to case
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        const note = await prisma.careNote.create({
            data: {
                caseId: params.id,
                ...data,
            },
        })

        // Update case status if needed
        if (data.updateStatus) {
            await prisma.careCase.update({
                where: { id: params.id },
                data: { status: data.updateStatus },
            })
        }

        return NextResponse.json(note, { status: 201 })
    } catch (error) {
        console.error('Error adding care note:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
