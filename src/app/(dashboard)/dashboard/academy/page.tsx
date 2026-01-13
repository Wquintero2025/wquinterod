'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, GraduationCap, Users } from 'lucide-react'

export default function AcademyPage() {
    const { data: courses, isLoading } = useQuery({
        queryKey: ['courses'],
        queryFn: async () => {
            const res = await fetch('/api/academy/courses')
            return res.json()
        },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Academy</h1>
                    <p className="text-gray-600 mt-1">Training and discipleship courses</p>
                </div>
                <Button>
                    <Plus size={20} className="mr-2" />
                    New Course
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="spinner w-8 h-8" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses?.map((course: any) => (
                        <Card key={course.id} hover>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{course.name}</CardTitle>
                                        <Badge variant="primary" className="mt-2">
                                            Level {course.level}
                                        </Badge>
                                    </div>
                                    <GraduationCap className="text-secondary-600" size={24} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {course.description || 'No description'}
                                </p>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Users size={16} />
                                        <span>{course.classes?.length || 0} classes</span>
                                    </div>
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
