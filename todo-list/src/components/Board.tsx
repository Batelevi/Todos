import React, { useEffect, useState } from 'react';
import { fetchTodos } from '../services/api';
import { Todo } from '../models/Todo';
import TodoDetailsModal from './TodoDetailsModal';
import AddTaskModal from './AddTaskModal';

const Board: React.FC = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
    const [filterUser, setFilterUser] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<'TODO' | 'IN PROGRESS' | 'DONE' | 'ALL'>('ALL');

    useEffect(() => {
        const loadTodos = async () => {
            try {
                const todosData = await fetchTodos();
                setTodos(todosData);
            } catch {
                alert("Failed to load todos");
            }
        };
        loadTodos();
    }, []);

    const getFilteredTodos = () => {
        return todos.filter((todo) => {
            const matchesStatus = filterStatus === 'ALL' || todo.status === filterStatus;
            const matchesUser = filterUser === 'ALL' || todo.assignedUser === filterUser;
            return matchesStatus && matchesUser;
        });
    };

    const getUniqueUsers = () => {
        const users = todos.map((todo) => todo.assignedUser);
        return Array.from(new Set(users)); 
    };
        
    const handleSaveNewTodo = (newTodo: Todo) => {
        setTodos((prevTodos) => [...prevTodos, newTodo]);
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        setTodos(todos.filter(todo => todo.id !== selectedTodo?.id));
        setSelectedTodo(null);
        setIsModalOpen(false);
    }

    const handleSaveEdit = async (updatedTodo: Todo) => {
        setSelectedTodo(updatedTodo);
        const todosData = await fetchTodos();
        setTodos(todosData);
        setIsModalOpen(false);
    };

    return (
        <div>
            <h2 className="header">To Do Board</h2>

            <div className="filters-container">
                <div className="filter-group">
                <label htmlFor="statusFilter">Filter by Status:</label>
                    <select
                        id="statusFilter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as 'TODO' | 'IN PROGRESS' | 'DONE' | 'ALL')}
                    >
                        <option value="ALL">All</option>
                        <option value="TODO">TODO</option>
                        <option value="IN PROGRESS">IN PROGRESS</option>
                        <option value="DONE">DONE</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="userFilter">Filter by User:</label>
                    <select
                        id="userFilter"
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                    >
                        <option value="ALL">All Users</option>
                        {getUniqueUsers().map((user) => (
                            <option key={user} value={user}>
                                {user}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button className="add-btn" onClick={() => setIsModalOpen(true)}>Add Task</button>

           {['TODO', 'IN PROGRESS', 'DONE'].map((status) => (
               <div key={status}>
                   <h3 className="status-header">{status}</h3>
                    <ul className="todo-list">
                        {getFilteredTodos()
                            .filter((todo) => todo.status === status)
                            .map((todo) => (
                                <li key={todo.id} className="todo-item" onClick={() => setSelectedTodo(todo)} >
                                    <span className="todo-title">{todo.title}</span>
                                    <span className="todo-date">{todo.createdAt}</span>
                                    <span className="todo-user">{todo.assignedUser}</span>
                                </li>
                            ))}
                    </ul>
                </div>
            ))}

            {selectedTodo && (
                <TodoDetailsModal
                    todo={selectedTodo}
                    onCloseClick={() => setSelectedTodo(null)}
                    onSave={handleSaveEdit}
                    onDelete={handleDelete }
                />
            )}

            {isModalOpen && (
                <AddTaskModal
                    onSave={handleSaveNewTodo}
                    onCloseClick={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Board;
