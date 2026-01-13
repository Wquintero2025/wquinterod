'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Users, Heart, GraduationCap, HeartHandshake, UsersRound, Calendar } from 'lucide-react'
import Link from 'next/link'

const stats = [
    { name: 'Total Members', value: '1,234', icon: Users, href: '/dashboard/persons', color: 'text-primary-600' },
    { name: 'Altar Calls (Month)', value: '45', icon: Heart, href: '/dashboard/altar-call', color: 'text-danger-600' },
    { name: 'Active Courses', value: '12', icon: GraduationCap, href: '/dashboard/academy', color: 'text-secondary-600' },
    { name: 'Open Care Cases', value: '8', icon: HeartHandshake, href: '/dashboard/care', color: 'text-warning-600' },
    { name: 'Active Groups', value: '28', icon: UsersRound, href: '/dashboard/groups', color: 'text-success-600' },
    { name: 'Upcoming Events', value: '6', icon: Calendar, href: '/dashboard/events', color: 'text-primary-600' },
]

export default function DashboardPage() {
    const { data: session } = useSession()

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {session?.user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-gray-600 mt-2">
                    Here's what's happening with {session?.user?.churchName} today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Link key={stat.name} href={stat.href}>
                            <Card hover className="h-full">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                        </div>
                                        <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                                            <Icon size={24} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                                <div className="w-2 h-2 rounded-full bg-primary-600 mt-2" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">New member added</p>
                                    <p className="text-xs text-gray-500 mt-1">John Doe joined the church</p>
                                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                                <div className="w-2 h-2 rounded-full bg-success-600 mt-2" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Course completed</p>
                                    <p className="text-xs text-gray-500 mt-1">15 students completed Foundations</p>
                                    <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-warning-600 mt-2" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Care case assigned</p>
                                    <p className="text-xs text-gray-500 mt-1">New counseling request assigned</p>
                                    <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming This Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                                <Calendar size={20} className="text-primary-600 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Sunday Service</p>
                                    <p className="text-xs text-gray-500 mt-1">Main Campus • 10:00 AM</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                                <GraduationCap size={20} className="text-secondary-600 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Leadership Training</p>
                                    <p className="text-xs text-gray-500 mt-1">Wednesday • 7:00 PM</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <UsersRound size={20} className="text-success-600 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Small Group Meetings</p>
                                    <p className="text-xs text-gray-500 mt-1">Various locations • Friday</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
