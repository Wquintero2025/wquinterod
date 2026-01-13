'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Building2, Users, Briefcase } from 'lucide-react'

export default function StructurePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Church Structure</h1>
                <p className="text-gray-600 mt-1">Organizational hierarchy and leadership</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Building2 className="text-primary-600" size={24} />
                            <CardTitle>Campuses</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-gray-900 mb-2">3</p>
                        <p className="text-sm text-gray-600">Active locations</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Briefcase className="text-secondary-600" size={24} />
                            <CardTitle>Ministries</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-gray-900 mb-2">12</p>
                        <p className="text-sm text-gray-600">Active ministries</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Users className="text-success-600" size={24} />
                            <CardTitle>Leaders</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-gray-900 mb-2">45</p>
                        <p className="text-sm text-gray-600">Active leaders</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Organizational Chart</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-gray-500">
                        <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
                        <p>Organizational chart visualization coming soon</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
