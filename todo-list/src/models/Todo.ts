export interface Todo {
    id: number;
    title: string;
    description: string;
    status: 'TODO' | 'IN PROGRESS' | 'DONE';
    createdAt?: string;
    assignedUser: string;
}
