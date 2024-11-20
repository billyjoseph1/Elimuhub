'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, LineChart, XAxis, YAxis, Bar, Line, ResponsiveContainer } from 'recharts'
import { Loader2, BarChartIcon, LineChartIcon, Download, ArrowLeft } from 'lucide-react'
import api from '../../lib/api'
import { Score, Subject } from '../../types'
import Link from 'next/link'

export default function Analytics() {
    const [scores, setScores] = useState<Score[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [scoresRes, subjectsRes] = await Promise.all([
                    api.get('/scores'),
                    api.get('/subjects')
                ])
                setScores(scoresRes.data as Score[])
                setSubjects(subjectsRes.data as Subject[])
                if (subjectsRes.data && Array.isArray(subjectsRes.data) && subjectsRes.data.length > 0) {
                    setSelectedSubject(String(subjectsRes.data[0].id))
                }
            } catch (error) {
                console.error('Error fetching data:', error)
                setError('Failed to load analytics data. Please try again later.')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const scoresBySubject = subjects.map(subject => ({
        name: subject.name,
        'Average Score': scores
            .filter(score => score.subjectId === subject.id)
            .reduce((sum, score) => sum + score.value, 0) /
            scores.filter(score => score.subjectId === subject.id).length || 0
    }))

    const scoresTrend = selectedSubject
        ? scores
            .filter(score => score.subjectId === Number(selectedSubject))
            .map(score => ({
                name: score.assignmentName,
                Score: score.value
            }))
        : []

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="p-6 space-y-6 bg-background">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back to Dashboard</span>
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold text-foreground">Academic Analytics</h1>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export Data
                </Button>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="trends">Trends</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChartIcon className="w-5 h-5 text-primary" />
                                Subject Performance
                            </CardTitle>
                            <CardDescription>Average scores across all subjects</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{
                                    'Average Score': {
                                        label: 'Average Score',
                                        color: 'hsl(var(--chart-1))',
                                    },
                                }}
                                className="h-[400px]"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={scoresBySubject} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="Average Score" fill="var(--color-Average Score)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="trends">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LineChartIcon className="w-5 h-5 text-primary" />
                                Score Trends
                            </CardTitle>
                            <CardDescription>Score progression for selected subject</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <Select
                                    value={selectedSubject || undefined}
                                    onValueChange={(value) => setSelectedSubject(value)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select a subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject.id} value={String(subject.id)}>
                                                {subject.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <ChartContainer
                                config={{
                                    Score: {
                                        label: 'Score',
                                        color: 'hsl(var(--chart-2))',
                                    },
                                }}
                                className="h-[400px]"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={scoresTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Line type="monotone" dataKey="Score" stroke="var(--color-Score)" strokeWidth={2} dot={{ fill: 'var(--color-Score)' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}