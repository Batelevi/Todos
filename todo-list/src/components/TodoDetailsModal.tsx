import React, { useState } from 'react';
import { Todo } from '../models/Todo';
import { History } from '../models/History';
import { fetchHistory, updateTodoInDatabase, createHistory, deleteTodo } from '../services/api';


interface TodoDetailsModalProps {
    todo: Todo;
    onSave: (updatedTodo: Todo) => void;
    onCloseClick: () => void;
    onDelete: () => void;
}


const TodoDetailsModal: React.FC<TodoDetailsModalProps> = ({ todo, onSave, onCloseClick, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTodo, setEditedTodo] = useState<Todo>(todo);
    const [historyRecords, setHistoryRecords] = useState<History[]>([]);
    const [showHistory, setShowHistory] = useState(false);


    const generateHistoryRecords = (updatedTodo: Todo): History[] => {
        const historyRecords: History[] = [];

        if (todo.title !== updatedTodo.title) {
            historyRecords.push({
                id: 0,
                todoId: updatedTodo.id,
                date: "",
                changeType: "Title Change",
                changedBy: updatedTodo.assignedUser,
                details: `Title changed from "${todo.title}" to "${updatedTodo.title}"`,
            });
        }

        if (todo.description !== updatedTodo.description) {
            historyRecords.push({
                id: 0,
                todoId: updatedTodo.id,
                date: "",
                changeType: "Description Change",
                changedBy: updatedTodo.assignedUser,
                details: `Description changed from "${todo.description}" to "${updatedTodo.description}"`,
            });
        }

        if (todo.assignedUser !== updatedTodo.assignedUser) {
            historyRecords.push({
                id: 0,
                todoId: updatedTodo.id,
                date: "",
                changeType: "Assigned user Change",
                changedBy: updatedTodo.assignedUser,
                details: `Assigned user changed from "${todo.assignedUser}" to "${updatedTodo.assignedUser}"`,
            });
        }

        if (todo.status !== updatedTodo.status) {
            historyRecords.push({
                id: 0,
                todoId: updatedTodo.id,
                date: "",
                changeType: "Status user Change",
                changedBy: updatedTodo.assignedUser,
                details: `Status changed from "${todo.status}" to "${updatedTodo.status}"`,
            });
        }

        return historyRecords;
    };

    const onSaveClick = async () => {
        if (!editedTodo.title || !editedTodo.description || !editedTodo.assignedUser) {
            alert("All fields are required!");
            return;
        }

        const historyRecords: History[] = generateHistoryRecords(editedTodo);
        try {
            if (historyRecords.length > 0) {
                await updateTodoInDatabase(editedTodo);
                await createHistory(historyRecords);

                onSave(editedTodo);
                setIsEditing(false);
            };
        } catch {
            alert("Failed to save");
        }
    }

    const onHistoryClick = async () => {
        setShowHistory(!showHistory);
        if (!showHistory) {
            try {
                const records = await fetchHistory(todo.id);
                setHistoryRecords(records);
            } catch (error) {
                alert("Failed to fetch history:");
            }
        }
    };

    const onDeleteClick = async () => {
        try {
            await deleteTodo(todo.id);
            onDelete();
        } catch {
            alert("Failed to delete todo");
        }
    }

    return (
        <div className={`todo-details-modal ${showHistory ? 'expanded' : ''}`}>
            <h3>Task Details</h3>
            {isEditing ? (
                <>
                    <div>
                        <label>Title:</label>
                        <input
                            type="text"
                            value={editedTodo.title || ""}
                            onChange={(e) =>
                                setEditedTodo({
                                    ...editedTodo,
                                    title: e.target.value
                                })
                            }
                        />
                    </div>
                    <div>
                        <label>Description:</label>
                        <textarea
                            value={editedTodo.description || ""}
                            onChange={(e) =>
                                setEditedTodo({
                                    ...editedTodo,
                                    description: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label>Assigned User:</label>
                        <input
                            type="text"
                            value={editedTodo.assignedUser || ""}
                            onChange={(e) =>
                                setEditedTodo({
                                    ...editedTodo,
                                    assignedUser: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label>Status:</label>
                        <select
                            value={editedTodo.status || ""}
                            onChange={(e) =>
                                setEditedTodo({
                                    ...editedTodo,
                                    status: e.target.value as 'TODO' | 'IN PROGRESS' | 'DONE'
                                })}
                        >
                            <option value="TODO">TODO</option>
                            <option value="IN PROGRESS">IN PROGRESS</option>
                            <option value="DONE">DONE</option>
                        </select>
                    </div>
                    <div>
                        <button className="save-btn" onClick={() => {
                            onSaveClick();
                            setIsEditing(false);
                        }}
                        >Save</button>
                        <button className="cancel-btn"
                            onClick={() => {
                                setIsEditing(false);
                            }}
                        >Cancel</button>
                    </div>
                </>
            ) : (
                <>
                    <p>
                        <strong>Title:</strong> {todo.title}
                    </p>
                    <p>
                        <strong>Description:</strong> {todo.description}
                    </p>
                    <p>
                        <strong>Assigned User:</strong> {todo.assignedUser}
                    </p>
                    <p>
                        <strong>Status:</strong> {todo.status}
                    </p>
                    <p>
                        <strong>Created At:</strong> {todo.createdAt}
                    </p>
                    <button onClick={() => {
                        setEditedTodo(todo);
                        setIsEditing(true);
                    }}>Edit</button>
                    <button onClick={onHistoryClick}>History</button>
                    <button onClick={onCloseClick}>Close</button>
                    <button className="cancel-btn" onClick={onDeleteClick}>Delete</button>
                    {showHistory && (
                        <div className="history-section">
                            <h4>History</h4>
                            {historyRecords.length > 0 ? (
                                <div className="history-cards">
                                    <ul>
                                        {historyRecords.map((record) => (
                                            <li key={record.id} className="history-card">
                                                <p><strong>Change Type:</strong> {record.changeType}</p>
                                                <p><strong>Change Date:</strong> {record.date}</p>
                                                <p><strong>Changed By:</strong> {record.changedBy}</p>
                                                <p><strong>Details:</strong> {record.details}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p>No history</p>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );

};

export default TodoDetailsModal;