'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Search, Plus, User } from 'lucide-react'

export default function PersonsPage() {
    const [search, setSearch] = useState('')
    const [spiritualStatus, setSpiritualStatus] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['persons', search, spiritualStatus],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (search) params.append('search', search)
            if (spiritualStatus) params.append('spiritualStatus', spiritualStatus)

            const res = await fetch(`/api/persons?${params}`)
            return res.json()
        },
    })

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'gray' | 'primary' | 'success' | 'warning'> = {
            VISITOR: 'gray',
            NEW_BELIEVER: 'primary',
            MEMBER: 'success',
            SERVANT: 'success',
            LEADER: 'warning',
        }
        return variants[status] || 'gray'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Persons</h1>
                    <p className="text-gray-600 mt-1">Manage church members and visitors</p>
                </div>
                <Link href="/dashboard/persons/new">
                    <Button>
                        <Plus size={20} className="mr-2" />
                        Add Person
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input pl-10"
                            />
                        </div>
                        <select
                            value={spiritualStatus}
                            onChange={(e) => setSpiritualStatus(e.target.value)}
                            className="input"
                        >
                            <option value="">All Spiritual Status</option>
                            <option value="VISITOR">Visitor</option>
                            <option value="NEW_BELIEVER">New Believer</option>
                            <option value="IN_PROCESS">In Process</option>
                            <option value="MEMBER">Member</option>
                            <option value="SERVANT">Servant</option>
                            <option value="LEADER">Leader</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {data?.total || 0} {data?.total === 1 ? 'Person' : 'Persons'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="spinner w-8 h-8" />
                        </div>
                    ) : data?.persons?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Contact</th>
                                        <th>Campus</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.persons.map((person: any) => (
                                        <tr key={person.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                        <User size={20} className="text-primary-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {person.firstName} {person.lastName}
                                                        </p>
                                                        {person.email && (
                                                            <p className="text-sm text-gray-500">{person.email}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {person.phone && (
                                                    <p className="text-sm text-gray-600">{person.phone}</p>
                                                )}
                                            </td>
                                            <td>
                                                {person.campus && (
                                                    <p className="text-sm text-gray-600">{person.campus.name}</p>
                                                )}
                                            </td>
                                            <td>
                                                <Badge variant={getStatusBadge(person.spiritualStatus)}>
                                                    {person.spiritualStatus.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Link href={`/dashboard/persons/${person.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        View
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <User size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">No persons found</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
