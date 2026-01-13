import { prisma } from './prisma'

interface PersonData {
    firstName: string
    lastName: string
    email?: string | null
    phone?: string | null
    campusId?: string | null
}

interface DuplicateCandidate {
    personId: string
    person: {
        id: string
        firstName: string
        lastName: string
        email: string | null
        phone: string | null
        campusId: string | null
    }
    confidenceScore: number
    matchReasons: string[]
}

/**
 * Levenshtein distance algorithm for string similarity
 */
function levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1]
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                )
            }
        }
    }

    return matrix[str2.length][str1.length]
}

/**
 * Calculate similarity percentage between two strings
 */
function stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) {
        return 100
    }

    const distance = levenshteinDistance(longer, shorter)
    return ((longer.length - distance) / longer.length) * 100
}

/**
 * Normalize phone number for comparison
 */
function normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '')
}

/**
 * Normalize email for comparison
 */
function normalizeEmail(email: string): string {
    return email.toLowerCase().trim()
}

/**
 * Normalize name for comparison
 */
function normalizeName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, ' ')
}

/**
 * Find potential duplicate persons in the database
 */
export async function findDuplicates(
    churchId: string,
    personData: PersonData,
    excludePersonId?: string
): Promise<DuplicateCandidate[]> {
    const candidates: DuplicateCandidate[] = []

    // Search by exact phone match
    if (personData.phone) {
        const normalizedPhone = normalizePhone(personData.phone)
        const phoneMatches = await prisma.person.findMany({
            where: {
                churchId,
                phone: {
                    contains: normalizedPhone.slice(-10), // Last 10 digits
                },
                id: excludePersonId ? { not: excludePersonId } : undefined,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                campusId: true,
            },
        })

        for (const match of phoneMatches) {
            if (match.phone && normalizePhone(match.phone).includes(normalizedPhone.slice(-10))) {
                candidates.push({
                    personId: match.id,
                    person: match,
                    confidenceScore: 90,
                    matchReasons: ['phone'],
                })
            }
        }
    }

    // Search by exact email match
    if (personData.email) {
        const normalizedEmail = normalizeEmail(personData.email)
        const emailMatches = await prisma.person.findMany({
            where: {
                churchId,
                email: normalizedEmail,
                id: excludePersonId ? { not: excludePersonId } : undefined,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                campusId: true,
            },
        })

        for (const match of emailMatches) {
            const existingIndex = candidates.findIndex(c => c.personId === match.id)
            if (existingIndex >= 0) {
                // Already found by phone, increase confidence
                candidates[existingIndex].confidenceScore = 95
                candidates[existingIndex].matchReasons.push('email')
            } else {
                candidates.push({
                    personId: match.id,
                    person: match,
                    confidenceScore: 90,
                    matchReasons: ['email'],
                })
            }
        }
    }

    // Search by name similarity
    const normalizedFirstName = normalizeName(personData.firstName)
    const normalizedLastName = normalizeName(personData.lastName)

    const nameMatches = await prisma.person.findMany({
        where: {
            churchId,
            OR: [
                { firstName: { contains: personData.firstName, mode: 'insensitive' } },
                { lastName: { contains: personData.lastName, mode: 'insensitive' } },
            ],
            id: excludePersonId ? { not: excludePersonId } : undefined,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            campusId: true,
        },
        take: 50, // Limit to avoid performance issues
    })

    for (const match of nameMatches) {
        // Skip if already matched by phone or email
        if (candidates.some(c => c.personId === match.id)) {
            continue
        }

        const firstNameSimilarity = stringSimilarity(
            normalizedFirstName,
            normalizeName(match.firstName)
        )
        const lastNameSimilarity = stringSimilarity(
            normalizedLastName,
            normalizeName(match.lastName)
        )

        // Calculate average similarity
        const nameSimilarity = (firstNameSimilarity + lastNameSimilarity) / 2

        // Only consider if similarity is high enough
        if (nameSimilarity >= 70) {
            let confidenceScore = nameSimilarity * 0.8 // Base score from name similarity

            // Boost confidence if same campus
            if (personData.campusId && match.campusId === personData.campusId) {
                confidenceScore += 10
            }

            // Only add if confidence is above threshold
            if (confidenceScore >= 70) {
                candidates.push({
                    personId: match.id,
                    person: match,
                    confidenceScore: Math.min(confidenceScore, 95),
                    matchReasons: ['name'],
                })
            }
        }
    }

    // Sort by confidence score (highest first)
    candidates.sort((a, b) => b.confidenceScore - a.confidenceScore)

    // Return top 10 matches
    return candidates.slice(0, 10)
}

/**
 * Create a duplicate match record for manual review
 */
export async function createDuplicateMatch(
    personId1: string,
    personId2: string,
    confidenceScore: number,
    matchReasons: string[]
) {
    // Ensure consistent ordering (lower ID first)
    const [p1, p2] = [personId1, personId2].sort()

    return await prisma.duplicateMatch.create({
        data: {
            personId1: p1,
            personId2: p2,
            confidenceScore,
            matchReasons,
            status: 'PENDING',
        },
    })
}

/**
 * Merge two person records (used when confirming duplicates)
 */
export async function mergePerson(
    keepPersonId: string,
    mergePersonId: string,
    churchId: string
) {
    // This is a complex operation that should be done in a transaction
    return await prisma.$transaction(async (tx) => {
        // Update all related records to point to the kept person
        await tx.altarCallEvent.updateMany({
            where: { personId: mergePersonId },
            data: { personId: keepPersonId },
        })

        await tx.enrollment.updateMany({
            where: { personId: mergePersonId },
            data: { personId: keepPersonId },
        })

        await tx.groupMembership.updateMany({
            where: { personId: mergePersonId },
            data: { personId: keepPersonId },
        })

        await tx.eventRegistration.updateMany({
            where: { personId: mergePersonId },
            data: { personId: keepPersonId },
        })

        await tx.eventAttendance.updateMany({
            where: { personId: mergePersonId },
            data: { personId: keepPersonId },
        })

        await tx.careCase.updateMany({
            where: { personId: mergePersonId },
            data: { personId: keepPersonId },
        })

        // Soft delete the merged person
        await tx.person.update({
            where: { id: mergePersonId },
            data: { isActive: false },
        })

        // Mark duplicate as confirmed
        await tx.duplicateMatch.updateMany({
            where: {
                OR: [
                    { personId1: mergePersonId },
                    { personId2: mergePersonId },
                ],
            },
            data: { status: 'CONFIRMED_DUPLICATE' },
        })

        return { success: true }
    })
}
