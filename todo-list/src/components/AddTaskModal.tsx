import React, { useState } from 'react';
import { Todo } from '../models/Todo';
import { createTodo } from '../services/api';


interface AddTaskModalProps {
    onSave: (newTodo: Todo) => void;
    onCloseClick: () => void;
}


const AddTaskModal: React.FC<AddTaskModalProps> = ({ onSave, onCloseClick }) => {
    const [newTodo, setNewTodo] = useState({
        title: "",
        description: "",
        assignedUser: "",
    });

    const onSaveClick = async () => {
        if (!newTodo.title || !newTodo.description || !newTodo.assignedUser) {
            alert("All fields are required!");
            return;
        }
        try {
            const addedTodo = await createTodo({
                ...newTodo,
                status: 'TODO',
            });

            onSave(addedTodo);
            setNewTodo({ title: "", description: "", assignedUser: "" });
        } catch {
            alert("Failed to create todo");
        }
    };

    return (
        <div className="modal">
            <h3>Add New Task</h3>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Title"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                />
            </div>
            <div className="input-group">
                <textarea
                    placeholder="Description"
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                ></textarea>
            </div>
            <div className="input-group">
                <input
                    placeholder="Assigned User"
                    value={newTodo.assignedUser}
                    onChange={(e) => setNewTodo({ ...newTodo, assignedUser: e.target.value })}
                />
            </div>
            <div>
                <button className="save-btn" onClick={onSaveClick}>Save</button>
                <button className="cancel-btn" onClick={onCloseClick}>Cancel</button>
            </div>
        </div>
    );
};

export default AddTaskModal;
