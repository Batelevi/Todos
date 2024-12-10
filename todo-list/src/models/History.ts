export interface History {
    id: number;
    todoId: number;
    date?: string;
    changeType: string;
    changedBy: string;
    details: string;
}