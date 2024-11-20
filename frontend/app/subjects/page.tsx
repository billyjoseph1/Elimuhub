'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Book, BookOpen, Plus, Trash2, ArrowLeft } from 'lucide-react'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

interface Subject {
    id: number;
    name: string;
    userId: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export default function Subjects() {
    const router = useRouter()
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [newSubject, setNewSubject] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [userId, setUserId] = useState<string | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token')
            const storedUserId = localStorage.getItem('userId')

            if (!token || !storedUserId) {
                router.push('/login')
                return
            }

            setUserId(storedUserId)
            setIsInitialized(true)
        }

        checkAuth()
    }, [router])

    useEffect(() => {
        const fetchSubjects = async () => {
            if (!userId || !isInitialized) return

            setLoading(true)
            try {
                const response = await api.get(`/subjects/${userId}`)
                if (response.data) {
                    setSubjects(response.data as Subject[])
                    setError('')
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.error || 'Failed to load subjects. Please try again.'
                setError(errorMessage)
                console.error('Error fetching subjects:', error)

                if (error.response?.status === 401) {
                    localStorage.removeItem('token')
                    localStorage.removeItem('userId')
                    router.push('/login')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchSubjects()
    }, [userId, isInitialized, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId) {
            setError('User not authenticated')
            return
        }
        if (!newSubject.trim()) {
            setError('Please enter a subject name')
            return
        }

        setLoading(true)
        try {
            const response = await api.post('/subjects', {
                name: newSubject.trim(),
                userId: parseInt(userId, 10)
            })

            if (response.data) {
                setSubjects(prev => [...prev, response.data as Subject])
                setNewSubject('')
                setError('')
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to add subject. Please try again.'
            setError(errorMessage)
            console.error('Error adding subject:', error)

            if (error.response?.status === 401) {
                localStorage.removeItem('token')
                localStorage.removeItem('userId')
                router.push('/login')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (subjectId: number) => {
        if (!userId) {
            setError('User not authenticated')
            return
        }

        try {
            await api.delete(`/subjects/${subjectId}`)
            setSubjects(prev => prev.filter(subject => subject.id !== subjectId))
            setError('')
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to delete subject. Please try again.'
            setError(errorMessage)
            console.error('Error deleting subject:', error)

            if (error.response?.status === 401) {
                localStorage.removeItem('token')
                localStorage.removeItem('userId')
                router.push('/login')
            }
        }
    }

    if (!isInitialized || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Loading your subjects...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
            <div className="container mx-auto p-6 space-y-6 max-w-6xl">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                            Academic Subjects
                        </h1>
                        <p className="text-gray-600 mt-1">Manage your course subjects</p>
                    </div>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Button>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2">
                                <Book className="w-5 h-5" />
                                Current Subjects
                            </CardTitle>
                            <CardDescription className="text-blue-100">Your active academic subjects</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[400px]">
                                <div className="p-4 space-y-3">
                                    {subjects.map((subject) => (
                                        <div
                                            key={subject.id}
                                            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Book className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                                                <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{subject.name}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(subject.id)}
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {subjects.length === 0 && (
                                        <div className="text-center text-gray-500 py-8">
                                            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                            No subjects added yet. Start by adding your first subject!
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Add New Subject
                            </CardTitle>
                            <CardDescription className="text-green-100">Add a new course to your curriculum</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        value={newSubject}
                                        onChange={(e) => setNewSubject(e.target.value)}
                                        placeholder="Enter subject name"
                                        className="flex-1"
                                        disabled={loading}
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        disabled={loading || !newSubject.trim()}
                                        className="min-w-[120px] bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {loading ? 'Adding...' : (
                                            <span className="flex items-center gap-2">
                                                <Plus className="w-4 h-4" />
                                                Add
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}