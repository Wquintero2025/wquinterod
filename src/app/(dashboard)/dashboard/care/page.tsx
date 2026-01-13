'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, HeartHandshake } from 'lucide-react'

export default function CarePage() {
    const [statusFilter, setStatusFilter] = useState('')

    const { data: cases, isLoading } = useQuery({
        queryKey: ['care-cases', statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (statusFilter) params.append('status', statusFilter)
            const res = await fetch(`/api/care/cases?${params}`)
            return res.json()
        },
    })

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'gray' | 'primary' | 'warning' | 'success'> = {
            NEW: 'primary',
            ASSIGNED: 'warning',
            IN_PROGRESS: 'warning',
            ON_HOLD: 'gray',
            CLOSED: 'success',
        }
        return variants[status] || 'gray'
    }

    const getUrgencyBadge = (urgency: string) => {
        const variants: Record<string, 'gray' | 'warning' | 'danger'> = {
            LOW: 'gray',
            MEDIUM: 'warning',
            HIGH: 'danger',
            CRITICAL: 'danger',
        }
        return variants[urgency] || 'gray'
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pastoral Care</h1>
                    <p className="text-gray-600 mt-1">Counseling and care cases</p>
                </div>
                <Button>
                    <Plus size={20} className="mr-2" />
                    New Case
                </Button>
            </div>

            <Card>
                <CardContent className="p-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input max-w-xs"
                    >
                        <option value="">All Status</option>
                        <option value="NEW">New</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="spinner w-8 h-8" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {cases?.map((caseItem: any) => (
                        <Card key={caseItem.id} hover>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <HeartHandshake className="text-warning-600" size={20} />
                                            <h3 className="font-semibold text-gray-900">{caseItem.caseNumber}</h3>
                                            <Badge variant={getStatusBadge(caseItem.status)}>
                                                {caseItem.status.replace('_', ' ')}
                                            </Badge>
                                            <Badge variant={getUrgencyBadge(caseItem.urgency)}>
                                                {caseItem.urgency}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            <span className="font-medium">Person:</span> {caseItem.person.firstName} {caseItem.person.lastName}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-2">
                                            <span className="font-medium">Need:</span> {caseItem.needType.replace('_', ' ')}
                                        </p>
                                        {caseItem.assignments?.length > 0 && (
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Counselor:</span>{' '}
                                                {caseItem.assignments[0].counselor.firstName} {caseItem.assignments[0].counselor.lastName}
                                            </p>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        View Case
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
