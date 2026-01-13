import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/care/cases - List care cases
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const urgency = searchParams.get('urgency')
        const counselorId = searchParams.get('counselorId')

        const where: any = {
            churchId: session.user.churchId,
        }

        if (status) where.status = status
        if (urgency) where.urgency = urgency
        if (counselorId) {
            where.assignments = {
                some: {
                    counselorId,
                    isActive: true,
                },
            }
        }

        const cases = await prisma.careCase.findMany({
            where,
            include: {
                person: true,
                assignments: {
                    where: { isActive: true },
                    include: { counselor: true },
                },
                notes: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: [
                { urgency: 'desc' },
                { createdAt: 'desc' },
            ],
        })

        return NextResponse.json(cases)
    } catch (error) {
        console.error('Error fetching care cases:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/care/cases - Create care case
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.churchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        // Generate case number
        const caseCount = await prisma.careCase.count({
            where: { churchId: session.user.churchId },
        })
        const caseNumber = `CARE-${new Date().getFullYear()}-${String(caseCount + 1).padStart(4, '0')}`

        const careCase = await prisma.careCase.create({
            data: {
                ...data,
                churchId: session.user.churchId,
                caseNumber,
                status: 'NEW',
            },
            include: {
                person: true,
            },
        })

        // Create timeline entry
        await prisma.personTimeline.create({
            data: {
                personId: careCase.personId,
                eventType: 'CARE_CASE_OPENED',
                title: 'Care case opened',
                description: `Case ${caseNumber}: ${careCase.needType}`,
            },
        })

        // Auto-assign if counselor specified
        if (data.counselorId) {
            await prisma.careAssignment.create({
                data: {
                    caseId: careCase.id,
                    counselorId: data.counselorId,
                    isActive: true,
                },
            })

            await prisma.careCase.update({
                where: { id: careCase.id },
                data: { status: 'ASSIGNED' },
            })
        }

        return NextResponse.json(careCase, { status: 201 })
    } catch (error) {
        console.error('Error creating care case:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
