import axios from "axios";
import { Todo } from "../models/Todo";
import { History } from "../models/History";

const API_BASE_URL = "http://localhost:7022/api/todo";

export const fetchTodos = async (): Promise<Todo[]> => {
    try
    {
        const response = await axios.get(`${API_BASE_URL}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching todos:", error);
        return [];
    }
};

export const createTodo = async (todo: { title: string; description: string; status: string; assignedUser: string }): Promise<Todo> => {
    try {
        const response = await axios.post(`${API_BASE_URL}`, todo, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data as Todo;
    } catch (error: any) {
        console.error("Error creating todo:", error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updateTodoInDatabase = async (updatedTodo: Todo) => {
    try {
        await axios.put(`${API_BASE_URL}/${updatedTodo.id}`, updatedTodo, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Failed to update todo:", error);
        throw error; 
    }
};

export const deleteTodo = async (todoId: number) => {
    try {
        await axios.delete(`${API_BASE_URL}/${todoId}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Failed to delete todo:", error);
        throw error; 
    }
}

export const fetchHistory = async (todoId: number): Promise<History[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/history/${todoId}`);
        return response.data; 
    } catch (error) {
        console.error("Error fetching history:", error);
        throw error; 
    }
};

export const createHistory = async (historyRecords: History[]): Promise<void> => {
    try {
        await axios.post(`${API_BASE_URL}/history`, historyRecords, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any) {
        console.error("Error creating history:", error.response ? error.response.data : error.message);
        alert("Failed to record history. Check console for details.");
        throw error;
    }
};