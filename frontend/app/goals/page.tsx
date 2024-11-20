'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Target, Calendar, Award, Trash2, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/lib/api';
import { Goal } from '@/types';
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

export default function Goals() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [newGoal, setNewGoal] = useState({ description: '', targetScore: '', deadline: '' });
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
                console.warn('User ID not found. Redirecting to login.');
                router.push('/login');
            }
        };

        initializeAuth();
    }, [router]);

    useEffect(() => {
        const fetchGoals = async () => {
            if (!userId || !isInitialized) return;

            setLoading(true);
            try {
                const response = await api.get(`/goals/${userId}`);
                setGoals(response.data as Goal[]);
                setError('');
            } catch (error) {
                setError('Failed to load goals. Please try again.');
                console.error('Error fetching goals:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGoals();
    }, [userId, isInitialized]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!userId) {
            setError('User is not authenticated. Please log in again.');
            router.push('/login');
            setLoading(false);
            return;
        }

        try {
            const formattedGoal = {
                description: newGoal.description,
                targetScore: parseFloat(newGoal.targetScore),
                deadline: new Date(newGoal.deadline).toISOString(),
                userId: userId,
            };

            const response = await api.post('/goals', formattedGoal);
            setGoals([...goals, response.data as Goal]);
            setNewGoal({ description: '', targetScore: '', deadline: '' });
            setError('');
        } catch (error) {
            setError('Failed to add goal. Please try again.');
            console.error('Error adding goal:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (goalId: number) => {
        try {
            await api.delete(`/goals/${goalId}`);
            setGoals(goals.filter((goal) => goal.id !== goalId));
        } catch (error) {
            setError('Failed to delete goal. Please try again.');
            console.error('Error deleting goal:', error);
        }
    };

    if (!isInitialized || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
                    <p className="text-xl text-purple-800 font-semibold">Loading your goals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
            <div className="container mx-auto p-6 space-y-6 max-w-6xl">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-blue-900 flex items-center gap-3">
                            <Target className="w-10 h-10 text-blue-600" />
                            Academic Goals
                        </h1>
                        <p className="text-blue-700 mt-2 text-lg">Track and manage your academic objectives</p>
                    </div>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        variant="outline"
                        className="flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-700"
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
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Award className="w-6 h-6" />
                                Current Goals
                            </CardTitle>
                            <CardDescription className="text-blue-100 text-lg">Your active academic objectives</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[400px] rounded-b-lg">
                                <div className="p-6 space-y-4">
                                    {goals.map((goal) => (
                                        <div
                                            key={goal.id}
                                            className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-2">
                                                    <h3 className="font-semibold text-lg text-blue-800">{goal.description}</h3>
                                                    <div className="flex items-center gap-2 text-blue-600">
                                                        <Award className="w-4 h-4" />
                                                        Target: {goal.targetScore}%
                                                    </div>
                                                    <div className="flex items-center gap-2 text-blue-600">
                                                        <Calendar className="w-4 h-4" />
                                                        Due: {new Date(goal.deadline).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(goal.id)}
                                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            </div>
                                            <Progress value={40} className="mt-3 bg-blue-200 [&>div]:bg-blue-600" />
                                        </div>
                                    ))}
                                    {goals.length === 0 && (
                                        <div className="text-center text-blue-600 py-12">
                                            <Target className="w-20 h-20 mx-auto text-blue-300 mb-4" />
                                            <p className="text-xl font-semibold">No goals set yet.</p>
                                            <p className="mt-2">Start by adding your first academic goal!</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
                        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Target className="w-6 h-6" />
                                Add New Goal
                            </CardTitle>
                            <CardDescription className="text-green-100 text-lg">Set a new academic objective</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">Goal Description</Label>
                                    <Input
                                        id="description"
                                        value={newGoal.description}
                                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                                        placeholder="E.g., Improve Math grade"
                                        className="w-full px-4 py-2 rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="targetScore" className="text-sm font-medium text-gray-700">Target Score (%)</Label>
                                    <Input
                                        id="targetScore"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={newGoal.targetScore}
                                        onChange={(e) => setNewGoal({ ...newGoal, targetScore: e.target.value })}
                                        placeholder="85"
                                        className="w-full px-4 py-2 rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deadline" className="text-sm font-medium text-gray-700">Deadline</Label>
                                    <Input
                                        id="deadline"
                                        type="date"
                                        value={newGoal.deadline}
                                        onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                        className="w-full px-4 py-2 rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Target className="w-5 h-5" />
                                            Add New Goal
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