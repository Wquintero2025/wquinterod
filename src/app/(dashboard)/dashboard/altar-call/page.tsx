'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AlertCircle, User, CheckCircle } from 'lucide-react'

export default function AltarCallPage() {
    const router = useRouter()
    const [step, setStep] = useState<'form' | 'duplicates' | 'success'>('form')
    const [isLoading, setIsLoading] = useState(false)
    const [duplicates, setDuplicates] = useState<any[]>([])
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        campusId: '',
        decisionType: 'SALVATION',
        invitedBy: '',
        notes: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch('/api/altar-calls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personData: {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        campusId: formData.campusId || null,
                    },
                    decisionType: formData.decisionType,
                    invitedBy: formData.invitedBy,
                    notes: formData.notes,
                }),
            })

            const data = await res.json()

            if (data.requiresReview) {
                setDuplicates(data.duplicates)
                setStep('duplicates')
            } else {
                setStep('success')
            }
        } catch (error) {
            console.error('Error submitting altar call:', error)
            alert('An error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateNew = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/altar-calls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personData: {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        campusId: formData.campusId || null,
                    },
                    decisionType: formData.decisionType,
                    invitedBy: formData.invitedBy,
                    notes: formData.notes,
                    skipDuplicateCheck: true,
                }),
            })

            if (res.ok) {
                setStep('success')
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUseExisting = async (personId: string) => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/altar-calls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    existingPersonId: personId,
                    decisionType: formData.decisionType,
                    invitedBy: formData.invitedBy,
                    notes: formData.notes,
                    skipDuplicateCheck: true,
                }),
            })

            if (res.ok) {
                setStep('success')
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (step === 'success') {
        return (
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} className="text-success-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Altar Call Recorded!</h2>
                        <p className="text-gray-600 mb-6">
                            The decision has been recorded and follow-up tasks have been created.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button onClick={() => {
                                setStep('form')
                                setFormData({
                                    firstName: '',
                                    lastName: '',
                                    email: '',
                                    phone: '',
                                    campusId: '',
                                    decisionType: 'SALVATION',
                                    invitedBy: '',
                                    notes: '',
                                })
                            }}>
                                Record Another
                            </Button>
                            <Button variant="secondary" onClick={() => router.push('/dashboard/persons')}>
                                View Persons
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (step === 'duplicates') {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <AlertCircle className="text-warning-600" size={24} />
                            <CardTitle>Potential Duplicates Found</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-6">
                            We found {duplicates.length} potential {duplicates.length === 1 ? 'match' : 'matches'} in the database.
                            Please review and select the appropriate action.
                        </p>

                        <div className="space-y-4">
                            {duplicates.map((dup: any) => (
                                <div key={dup.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                    <User size={20} className="text-primary-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {dup.firstName} {dup.lastName}
                                                    </p>
                                                    <Badge variant="warning">
                                                        {dup.confidenceScore}% Match
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm ml-13">
                                                {dup.email && (
                                                    <p className="text-gray-600">
                                                        <span className="font-medium">Email:</span> {dup.email}
                                                    </p>
                                                )}
                                                {dup.phone && (
                                                    <p className="text-gray-600">
                                                        <span className="font-medium">Phone:</span> {dup.phone}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="mt-2 flex gap-2">
                                                {dup.matchReasons.map((reason: string) => (
                                                    <Badge key={reason} variant="gray">
                                                        {reason}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleUseExisting(dup.id)}
                                            disabled={isLoading}
                                        >
                                            Use This Person
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <Button
                                variant="secondary"
                                onClick={handleCreateNew}
                                disabled={isLoading}
                                isLoading={isLoading}
                                className="w-full"
                            >
                                Create New Person (Not a Duplicate)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Altar Call</h1>
                <p className="text-gray-600 mt-1">Record a new decision or response</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Person Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                            <Input
                                label="Last Name"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </div>

                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />

                        <Input
                            label="Phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Decision Type <span className="text-danger-500">*</span>
                            </label>
                            <select
                                value={formData.decisionType}
                                onChange={(e) => setFormData({ ...formData, decisionType: e.target.value })}
                                className="input"
                                required
                            >
                                <option value="SALVATION">Salvation</option>
                                <option value="REDEDICATION">Rededication</option>
                                <option value="BAPTISM">Baptism</option>
                                <option value="MEMBERSHIP">Membership</option>
                                <option value="PRAYER_REQUEST">Prayer Request</option>
                                <option value="COUNSELING">Counseling</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <Input
                            label="Invited By"
                            value={formData.invitedBy}
                            onChange={(e) => setFormData({ ...formData, invitedBy: e.target.value })}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="input"
                                rows={4}
                                placeholder="Additional notes about this decision..."
                            />
                        </div>

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Submit Altar Call
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
