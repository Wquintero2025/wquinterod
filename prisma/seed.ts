import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Create demo church
    const church = await prisma.church.create({
        data: {
            name: 'Grace Community Church',
            slug: 'grace-community',
            email: 'info@gracechurch.com',
            phone: '+1-555-0100',
            address: '123 Main Street',
            city: 'Springfield',
            state: 'IL',
            country: 'USA',
            timezone: 'America/Chicago',
        },
    })

    console.log('✅ Created church:', church.name)

    // Create campuses
    const mainCampus = await prisma.campus.create({
        data: {
            churchId: church.id,
            name: 'Main Campus',
            address: '123 Main Street',
            city: 'Springfield',
            phone: '+1-555-0100',
            isMain: true,
        },
    })

    const northCampus = await prisma.campus.create({
        data: {
            churchId: church.id,
            name: 'North Campus',
            address: '456 North Ave',
            city: 'Springfield',
            phone: '+1-555-0101',
            isMain: false,
        },
    })

    console.log('✅ Created campuses')

    // Create admin person
    const adminPerson = await prisma.person.create({
        data: {
            churchId: church.id,
            campusId: mainCampus.id,
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@church.com',
            phone: '+1-555-0001',
            gender: 'MALE',
            spiritualStatus: 'LEADER',
            firstVisitDate: new Date('2020-01-01'),
            membershipDate: new Date('2020-02-01'),
        },
    })

    // Create admin user
    const passwordHash = await hash('password', 10)
    await prisma.user.create({
        data: {
            churchId: church.id,
            personId: adminPerson.id,
            email: 'admin@church.com',
            passwordHash,
            role: 'ADMIN',
        },
    })

    console.log('✅ Created admin user (admin@church.com / password)')

    // Create sample persons
    const persons = await Promise.all([
        prisma.person.create({
            data: {
                churchId: church.id,
                campusId: mainCampus.id,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@email.com',
                phone: '+1-555-0002',
                gender: 'MALE',
                maritalStatus: 'MARRIED',
                spiritualStatus: 'MEMBER',
                firstVisitDate: new Date('2023-01-15'),
                salvationDate: new Date('2023-02-20'),
                membershipDate: new Date('2023-06-01'),
            },
        }),
        prisma.person.create({
            data: {
                churchId: church.id,
                campusId: mainCampus.id,
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@email.com',
                phone: '+1-555-0003',
                gender: 'FEMALE',
                maritalStatus: 'SINGLE',
                spiritualStatus: 'NEW_BELIEVER',
                firstVisitDate: new Date('2024-01-01'),
                salvationDate: new Date('2024-01-05'),
            },
        }),
        prisma.person.create({
            data: {
                churchId: church.id,
                campusId: northCampus.id,
                firstName: 'Mike',
                lastName: 'Johnson',
                email: 'mike.j@email.com',
                phone: '+1-555-0004',
                gender: 'MALE',
                spiritualStatus: 'VISITOR',
                firstVisitDate: new Date('2024-01-10'),
            },
        }),
    ])

    console.log('✅ Created sample persons')

    // Create courses
    const foundationsCourse = await prisma.course.create({
        data: {
            churchId: church.id,
            name: 'Foundations of Faith',
            description: 'Introduction to Christian beliefs and practices',
            level: 1,
            durationWeeks: 8,
        },
    })

    const leadershipCourse = await prisma.course.create({
        data: {
            churchId: church.id,
            name: 'Leadership Training',
            description: 'Developing servant leaders',
            level: 2,
            prerequisites: [foundationsCourse.id],
            durationWeeks: 12,
        },
    })

    console.log('✅ Created courses')

    // Create groups
    await Promise.all([
        prisma.group.create({
            data: {
                churchId: church.id,
                campusId: mainCampus.id,
                name: 'Young Adults Cell Group',
                description: 'Weekly gathering for young adults',
                groupType: 'CELL',
                meetingDay: 'Friday',
                meetingTime: '7:00 PM',
            },
        }),
        prisma.group.create({
            data: {
                churchId: church.id,
                campusId: mainCampus.id,
                name: 'Worship Ministry',
                description: 'Praise and worship team',
                groupType: 'MINISTRY',
            },
        }),
    ])

    console.log('✅ Created groups')

    // Create events
    await Promise.all([
        prisma.event.create({
            data: {
                churchId: church.id,
                campusId: mainCampus.id,
                name: 'Sunday Service',
                description: 'Weekly worship service',
                eventType: 'WORSHIP_SERVICE',
                startDateTime: new Date('2024-01-21T10:00:00'),
                endDateTime: new Date('2024-01-21T12:00:00'),
                requiresReg: false,
            },
        }),
        prisma.event.create({
            data: {
                churchId: church.id,
                campusId: mainCampus.id,
                name: 'Leadership Conference 2024',
                description: 'Annual leadership training conference',
                eventType: 'CONFERENCE',
                startDateTime: new Date('2024-03-15T09:00:00'),
                endDateTime: new Date('2024-03-17T17:00:00'),
                maxAttendees: 200,
                requiresReg: true,
            },
        }),
    ])

    console.log('✅ Created events')

    console.log('🎉 Seed completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
