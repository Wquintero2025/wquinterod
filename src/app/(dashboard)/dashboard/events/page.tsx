'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, Calendar as CalendarIcon, MapPin, Users } from 'lucide-react'

export default function EventsPage() {
    const { data: events, isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const res = await fetch('/api/events')
            return res.json()
        },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Events</h1>
                    <p className="text-gray-600 mt-1">Church events and services</p>
                </div>
                <Button>
                    <Plus size={20} className="mr-2" />
                    New Event
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="spinner w-8 h-8" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {events?.map((event: any) => (
                        <Card key={event.id} hover>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4 flex-1">
                                        <div className="flex flex-col items-center justify-center bg-primary-50 rounded-lg p-3 min-w-[80px]">
                                            <span className="text-2xl font-bold text-primary-700">
                                                {format(new Date(event.startDateTime), 'd')}
                                            </span>
                                            <span className="text-sm text-primary-600">
                                                {format(new Date(event.startDateTime), 'MMM')}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                                                <Badge variant="primary">
                                                    {event.eventType.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            {event.description && (
                                                <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                                            )}
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon size={14} />
                                                    <span>
                                                        {format(new Date(event.startDateTime), 'h:mm a')} -{' '}
                                                        {format(new Date(event.endDateTime), 'h:mm a')}
                                                    </span>
                                                </div>
                                                {event.campus && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={14} />
                                                        <span>{event.campus.name}</span>
                                                    </div>
                                                )}
                                                {event._count && (
                                                    <div className="flex items-center gap-2">
                                                        <Users size={14} />
                                                        <span>{event._count.attendances} attendees</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
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
