'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart, DonutChart } from '@tremor/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BookOpen, Target, Trophy, BarChartIcon as ChartBar, Loader2, User, Calendar } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation'
import api from '../../lib/api'
import { Subject, Score, Goal } from '../../types'

function getCurrentUserId(): string | null {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('token')
    if (!token) {
        console.warn('Token not found in localStorage')
        return null
    }
    try {
        const decoded: { userId: string } = jwtDecode(token)
        return decoded.userId
    } catch (error) {
        console.error('Error decoding token:', error)
        return null
    }
}

export default function Dashboard() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [scores, setScores] = useState<Score[]>([])
    const [goals, setGoals] = useState<Goal[]>([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<number | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const getCurrentUserId = () => {
            const token = localStorage.getItem('token')
            if (!token) {
                console.warn('Token not found in localStorage')
                router.push('/login')
                return null
            }
            try {
                const decoded: { userId: string } = jwtDecode(token)
                return decoded.userId
            } catch (error) {
                console.error('Error decoding token:', error)
                router.push('/login')
                return null
            }
        }

        const storedUserId = getCurrentUserId()
        if (storedUserId) {
            setUserId(parseInt(storedUserId))
            setIsInitialized(true)
        }
    }, [router])

    useEffect(() => {
        const fetchData = async () => {
            if (!userId || !isInitialized) return

            setLoading(true)
            try {
                const [subjectsRes, scoresRes, goalsRes] = await Promise.all([
                    api.get(`/subjects?userId=${userId}`),
                    api.get(`/scores?userId=${userId}`),
                    api.get(`/goals?userId=${userId}`)
                ])

                setSubjects(subjectsRes.data as Subject[])
                setScores(scoresRes.data as Score[])
                setGoals(goalsRes.data as Goal[])
                setError('')
            } catch (error) {
                setError('Failed to load data. Please try again.')
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [userId, isInitialized])

    const LoadingState = () => (
        <div className="flex items-center justify-center h-72">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    )

    const NoDataState = () => (
        <div className="flex flex-col items-center justify-center h-72 text-muted-foreground">
            <ChartBar className="w-12 h-12 mb-2" />
            <p>No data available</p>
        </div>
    )

    const chartData = scores.map(score => ({
        name: score.assignmentName,
        Score: score.value
    }))

    const subjectScores = subjects.map(subject => ({
        name: subject.name,
        'Average Score': scores
            .filter(score => score.subjectId === subject.id)
            .reduce((sum, score) => sum + score.value, 0) /
            scores.filter(score => score.subjectId === subject.id).length || 0
    }))

    const recentGoals = goals.slice(0, 3)

    return (
        <div className="p-6 space-y-6 bg-background min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Academic Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Track your academic progress and goals</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString()}
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <User className="w-4 h-4" />
                        Profile
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap gap-4">
                <Button asChild variant="outline" className="gap-2">
                    <Link href="/subjects">
                        <BookOpen className="w-4 h-4" />
                        Subjects
                    </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                    <Link href="/scores">
                        <Trophy className="w-4 h-4" />
                        Scores
                    </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                    <Link href="/goals">
                        <Target className="w-4 h-4" />
                        Goals
                    </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                    <Link href="/analytics">
                        <ChartBar className="w-4 h-4" />
                        Analytics
                    </Link>
                </Button>
            </div>

            {error && (
                <div className="text-destructive text-center bg-destructive/10 p-3 rounded-lg">
                    {error}
                </div>
            )}

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="subjects">Subjects</TabsTrigger>
                    <TabsTrigger value="scores">Scores</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="shadow-lg col-span-1 md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-primary" />
                                    Recent Scores
                                </CardTitle>
                                <CardDescription>Your latest assignment performances</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <LoadingState />
                                ) : chartData.length > 0 ? (
                                    <BarChart
                                        data={chartData}
                                        index="name"
                                        categories={['Score']}
                                        colors={['primary']}
                                        valueFormatter={(number) => `${number}%`}
                                        yAxisWidth={40}
                                        className="h-72"
                                    />
                                ) : (
                                    <NoDataState />
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ChartBar className="w-5 h-5 text-primary" />
                                    Subject Performance
                                </CardTitle>
                                <CardDescription>Average scores by subject</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <LoadingState />
                                ) : subjectScores.length > 0 ? (
                                    <DonutChart
                                        data={subjectScores}
                                        category="Average Score"
                                        index="name"
                                        valueFormatter={(number) => `${number.toFixed(2)}%`}
                                        colors={['slate', 'violet', 'indigo', 'rose', 'cyan', 'amber']}
                                        className="h-72"
                                    />
                                ) : (
                                    <NoDataState />
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg col-span-1 md:col-span-2 lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary" />
                                    Recent Goals
                                </CardTitle>
                                <CardDescription>Your latest academic goals</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <LoadingState />
                                ) : recentGoals.length > 0 ? (
                                    <ul className="space-y-4">
                                        {recentGoals.map((goal) => (
                                            <li key={goal.id} className="flex items-center justify-between bg-muted p-4 rounded-lg">
                                                <div>
                                                    <h3 className="font-semibold">{goal.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                                                </div>
                                                <Button variant="outline" size="sm">View</Button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <NoDataState />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="subjects">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Subjects Overview</CardTitle>
                            <CardDescription>Your enrolled subjects and their details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <LoadingState />
                            ) : subjects.length > 0 ? (
                                <ul className="space-y-4">
                                    {subjects.map((subject) => (
                                        <li key={subject.id} className="flex items-center justify-between bg-muted p-4 rounded-lg">
                                            <div>
                                                <h3 className="font-semibold">{subject.name}</h3>
                                                <p className="text-sm text-muted-foreground">{subject.description}</p>
                                            </div>
                                            <Button variant="outline" size="sm">Details</Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <NoDataState />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="scores">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Scores Overview</CardTitle>
                            <CardDescription>Your recent assignment and test scores</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <LoadingState />
                            ) : scores.length > 0 ? (
                                <ul className="space-y-4">
                                    {scores.map((score) => (
                                        <li key={score.id} className="flex items-center justify-between bg-muted p-4 rounded-lg">
                                            <div>
                                                <h3 className="font-semibold">{score.assignmentName}</h3>
                                                <p className="text-sm text-muted-foreground">Score: {score.value}%</p>
                                            </div>
                                            <Button variant="outline" size="sm">Details</Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <NoDataState />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="goals">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Goals Overview</CardTitle>
                            <CardDescription>Your academic goals and progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <LoadingState />
                            ) : goals.length > 0 ? (
                                <ul className="space-y-4">
                                    {goals.map((goal) => (
                                        <li key={goal.id} className="flex items-center justify-between bg-muted p-4 rounded-lg">
                                            <div>
                                                <h3 className="font-semibold">{goal.title}</h3>
                                                <p className="text-sm text-muted-foreground">{goal.description}</p>
                                            </div>
                                            <Button variant="outline" size="sm">Update</Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <NoDataState />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}