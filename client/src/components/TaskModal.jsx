const TaskModal = ({ task, employees, onSave, onClose }) => {
    const isEditing = !!task;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            deadline: formData.get('deadline'),
            status: formData.get('status'),
            assignedTo: formData.get('assignedTo') || null,
        };
        onSave(data);
    };

    const formatDateForInput = (dateStr) => {
        if (!dateStr) {
            const today = new Date();
            return today.toISOString().split('T')[0];
        }
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
                    <button className="btn-icon" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                name="title"
                                type="text"
                                defaultValue={task?.title || ''}
                                required
                                placeholder="Enter task title..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                defaultValue={task?.description || ''}
                                placeholder="Describe the task..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Priority</label>
                            <select name="priority" defaultValue={task?.priority || 'Medium'}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Deadline</label>
                            <input
                                name="deadline"
                                type="date"
                                defaultValue={formatDateForInput(task?.deadline)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select name="status" defaultValue={task?.status || 'Pending'}>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Assign To</label>
                            <select name="assignedTo" defaultValue={task?.assignedTo?._id || ''}>
                                <option value="">Unassigned</option>
                                {employees.map((emp) => (
                                    <option key={emp._id} value={emp._id}>
                                        {emp.name} ({emp.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {isEditing ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;