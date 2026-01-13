'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, UsersRound, MapPin } from 'lucide-react'

export default function GroupsPage() {
    const { data: groups, isLoading } = useQuery({
        queryKey: ['groups'],
        queryFn: async () => {
            const res = await fetch('/api/groups')
            return res.json()
        },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
                    <p className="text-gray-600 mt-1">Small groups and ministries</p>
                </div>
                <Button>
                    <Plus size={20} className="mr-2" />
                    New Group
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="spinner w-8 h-8" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups?.map((group: any) => (
                        <Card key={group.id} hover>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{group.name}</CardTitle>
                                        <Badge variant="primary" className="mt-2">
                                            {group.groupType.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <UsersRound className="text-success-600" size={24} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {group.description && (
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {group.description}
                                    </p>
                                )}
                                {group.campus && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                        <MapPin size={14} />
                                        <span>{group.campus.name}</span>
                                    </div>
                                )}
                                {group.meetingDay && (
                                    <p className="text-sm text-gray-600 mb-3">
                                        {group.meetingDay} {group.meetingTime && `at ${group.meetingTime}`}
                                    </p>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                        {group.memberships?.length || 0} members
                                    </span>
                                    <Button variant="ghost" size="sm">
                                        View Details
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
