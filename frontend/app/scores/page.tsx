'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GraduationCap, Calendar, Book, PenTool, Trash2, Plus, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { Score, Subject } from '@/types';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

function getCurrentUserId(): string | null {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('Token not found in localStorage');
        return null;
    }
    try {
        const decoded: { userId: string } = jwtDecode(token);
        return decoded.userId;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

export default function Scores() {
    const [scores, setScores] = useState<Score[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [newScore, setNewScore] = useState({ value: '', assignmentName: '', date: '', subjectId: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState<number | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const initializeAuth = () => {
            const storedUserId = getCurrentUserId();

            if (storedUserId) {
                setUserId(parseInt(storedUserId));
                setIsInitialized(true);
            } else {
                console.warn('Token or User ID not found in localStorage. Redirecting to login.');
                router.push('/login');
            }
        };

        initializeAuth();
    }, [router]);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId || !isInitialized) return;

            setLoading(true);
            try {
                const [scoresRes, subjectsRes] = await Promise.all([
                    api.get(`/scores/${userId}`),
                    api.get(`/subjects/${userId}`)
                ]);
                setScores(scoresRes.data as Score[]);
                setSubjects(subjectsRes.data as Subject[]);
                setError('');
            } catch (error) {
                setError('Failed to load data. Please try again.');
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, isInitialized]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!userId) {
            setError('User is not authenticated. Please log in again.');
            router.push('/login');
            setLoading(false);
            return;
        }

        try {
            if (!newScore.value || !newScore.assignmentName || !newScore.date || !newScore.subjectId) {
                throw new Error('All fields are required');
            }

            const formattedScore = {
                value: parseFloat(newScore.value),
                assignmentName: newScore.assignmentName,
                date: new Date(newScore.date).toISOString(),
                subjectId: parseInt(newScore.subjectId),
                userId: userId,
            };

            const response = await api.post('/scores', formattedScore);

            if (response.data) {
                setScores((prevScores) => [...prevScores, response.data as Score]);
                setNewScore({ value: '', assignmentName: '', date: '', subjectId: '' });
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.details || error.message || 'Failed to add score';
            setError(errorMessage);
            console.error('Score submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (scoreId: number) => {
        try {
            await api.delete(`/scores/${scoreId}`);
            setScores(scores.filter((score) => score.id !== scoreId));
        } catch (error) {
            setError('Failed to delete score. Please try again.');
            console.error('Error deleting score:', error);
        }
    };

    const getScoreColor = (value: number) => {
        if (value >= 90) return 'text-green-600';
        if (value >= 80) return 'text-blue-600';
        if (value >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (!isInitialized || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-600"></div>
                    <p className="text-xl text-yellow-800 font-semibold">Loading your scores...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 min-h-screen">
            <div className="container mx-auto p-6 space-y-6 max-w-6xl">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-yellow-900 flex items-center gap-3">
                            <GraduationCap className="w-10 h-10 text-yellow-600" />
                            Academic Scores
                        </h1>
                        <p className="text-yellow-700 mt-2 text-lg">Track and manage your academic performance</p>
                    </div>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        variant="outline"
                        className="flex items-center gap-2 bg-white hover:bg-yellow-50 text-yellow-700"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Button>
                </div>

                {error && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
                        <CardHeader className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Book className="w-6 h-6" />
                                Recent Scores
                            </CardTitle>
                            <CardDescription className="text-yellow-100 text-lg">Your latest academic achievements</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[400px] rounded-b-lg">
                                <div className="p-6 space-y-4">
                                    {scores.map((score) => (
                                        <div
                                            key={score.id}
                                            className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:shadow-md transition-all duration-300"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-2">
                                                    <h3 className="font-semibold text-lg text-yellow-800">{score.assignmentName}</h3>
                                                    <div className="flex items-center gap-2 text-yellow-600">
                                                        <Book className="w-4 h-4" />
                                                        {score.subject?.name}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-yellow-600">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(score.date).toLocaleDateString()}
                                                    </div>
                                                    <div className={`text-lg font-bold ${getScoreColor(score.value)}`}>
                                                        {score.value}%
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(score.id)}
                                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {scores.length === 0 && (
                                        <div className="text-center text-yellow-600 py-12">
                                            <GraduationCap className="w-20 h-20 mx-auto text-yellow-300 mb-4" />
                                            <p className="text-xl font-semibold">No scores recorded yet.</p>
                                            <p className="mt-2">Start by adding your first academic score!</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
                        <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <PenTool className="w-6 h-6" />
                                Add New Score
                            </CardTitle>
                            <CardDescription className="text-orange-100 text-lg">Record a new academic achievement</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="value" className="text-sm font-medium text-gray-700">Score (%)</Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={newScore.value}
                                        onChange={(e) => setNewScore({ ...newScore, value: e.target.value })}
                                        placeholder="95"
                                        className="w-full px-4 py-2 rounded-md border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 transition duration-200"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assignmentName" className="text-sm font-medium text-gray-700">Assignment Name</Label>
                                    <Input
                                        id="assignmentName"
                                        value={newScore.assignmentName}
                                        onChange={(e) => setNewScore({ ...newScore, assignmentName: e.target.value })}
                                        placeholder="Midterm Exam"
                                        className="w-full px-4 py-2 rounded-md border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 transition duration-200"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date" className="text-sm font-medium text-gray-700">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={newScore.date}
                                        onChange={(e) => setNewScore({ ...newScore, date: e.target.value })}
                                        className="w-full px-4 py-2 rounded-md border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 transition duration-200"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Subject</Label>
                                    <Select
                                        onValueChange={(value) => setNewScore({ ...newScore, subjectId: value })}
                                    >
                                        <SelectTrigger className="w-full px-4 py-2 rounded-md border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 transition duration-200">
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

                                <Button
                                    type="submit"
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            Add Score
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}