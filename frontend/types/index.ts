// Define a type for the User model, excluding generated fields
export interface User {
    email: string;
    password: string;
    name: string;
    // Relations are typically not included in input types
}

// Define a type for the Subject model, excluding generated fields
export interface Subject {
    id: number;
    name: string;
    userId: number;
    description?: string;
    // Relations are typically not included in input types
}

// Define a type for the Score model, excluding generated fields
export interface Score {
    id: number;
    value: number;
    assignmentName: string;
    date: Date;
    subjectId: number;
    userId: number;
    subject?: Subject;
    // Optional relation to Feedback is not included in input types
}

// Define a type for the Goal model, excluding generated fields
export interface Goal {
    id: number;
    title?: string; 
    description: string;
    targetScore: number;
    achievedScore?: number; // Optional field
    deadline: Date;
    userId: number; // Foreign key to User
    // Relations are typically not included in input types
}

// Define a type for the Feedback model, excluding generated fields
export interface Feedback {
    id: number;
    content: string;
    scoreId: number; // Foreign key to Score
    userId: number; // Foreign key to User
    // Relations are typically not included in input types
}

export interface LoginResponse {
    token: string;
    user: { id: number }
}

export interface LoginFormData {
    email: string
    password: string
}

export interface RegisterResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        // Add other user-related properties if needed
    };
    expiresIn: string; // or number, depending on your API
}