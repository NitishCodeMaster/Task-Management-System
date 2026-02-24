import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import TaskModal from '../components/TaskModal';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [statsRes, tasksRes, employeesRes] = await Promise.all([
                api.get('/dashboard'),
                api.get('/tasks'),
                api.get('/users/employees'),
            ]);
            setStats(statsRes.data);
            setTasks(tasksRes.data);
            setEmployees(employeesRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateTask = () => {
        setEditingTask(null);
        setModalOpen(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setModalOpen(true);
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            toast.success('Task deleted successfully!');
            fetchData();
        } catch (err) {
            console.error('Failed to delete task:', err);
        }
    };

    const handleSaveTask = async (data) => {
        try {
            if (editingTask) {
                await api.put(`/tasks/${editingTask._id}`, data);
                toast.success('Task updated successfully!');
            } else {
                await api.post('/tasks', data);
                toast.success('New task created!');
            }
            setModalOpen(false);
            setEditingTask(null);
            fetchData();
        } catch (err) {
            console.error('Failed to save task:', err);
        }
    };

    const getPriorityBadge = (priority) => {
        const cls = priority === 'High' ? 'badge-high' : priority === 'Medium' ? 'badge-medium' : 'badge-low';
        return <span className={`badge ${cls}`}>{priority}</span>;
    };

    const getStatusBadge = (status) => {
        const cls =
            status === 'Completed'
                ? 'badge-completed'
                : status === 'In Progress'
                    ? 'badge-in-progress'
                    : 'badge-pending';
        return <span className={`badge ${cls}`}>{status}</span>;
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="layout">
                <Sidebar activeTab={activeTab} onTabChange={setActiveTab} sidebarOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />
                <div className="main-content">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="layout">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} sidebarOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />

            <div className="navbar">
                <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
                <span className="navbar-title">
                    {activeTab === 'dashboard' && 'Admin Dashboard'}
                    {activeTab === 'tasks' && 'Task Management'}
                    {activeTab === 'create' && 'Create Task'}
                </span>
                <div className="navbar-actions">
                    {activeTab !== 'create' && (
                        <button className="btn btn-primary btn-sm" onClick={handleCreateTask}>
                            ➕ New Task
                        </button>
                    )}
                </div>
            </div>

            <main className="main-content">
                
                {activeTab === 'dashboard' && stats && (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card purple">
                                <div className="stat-icon">📋</div>
                                <div className="stat-value">{stats.totalTasks}</div>
                                <div className="stat-label">Total Tasks</div>
                            </div>
                            <div className="stat-card green">
                                <div className="stat-icon">✅</div>
                                <div className="stat-value">{stats.completedTasks}</div>
                                <div className="stat-label">Completed</div>
                            </div>
                            <div className="stat-card orange">
                                <div className="stat-icon">⏳</div>
                                <div className="stat-value">{stats.pendingTasks}</div>
                                <div className="stat-label">Pending</div>
                            </div>
                            <div className="stat-card blue">
                                <div className="stat-icon">👥</div>
                                <div className="stat-value">{stats.totalUsers}</div>
                                <div className="stat-label">Employees</div>
                            </div>
                        </div>

                        <div className="section-header">
                            <h2 className="section-title">Recent Tasks</h2>
                        </div>

                        {tasks.length === 0 ? (
                            <div className="empty-state">
                                <div className="icon">📭</div>
                                <h3>No tasks yet</h3>
                                <p>Create your first task to get started</p>
                            </div>
                        ) : (
                            <div className="task-table-container">
                                <table className="task-table">
                                    <thead>
                                        <tr>
                                            <th>Task</th>
                                            <th>Priority</th>
                                            <th>Assigned To</th>
                                            <th>Status</th>
                                            <th>Deadline</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks.slice(0, 5).map((task) => (
                                            <tr key={task._id}>
                                                <td className="task-title-cell">{task.title}</td>
                                                <td>{getPriorityBadge(task.priority)}</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>
                                                    {task.assignedTo?.name || '—'}
                                                </td>
                                                <td>{getStatusBadge(task.status)}</td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                                    {formatDate(task.deadline)}
                                                </td>
                                                <td>
                                                    <div className="task-actions">
                                                        <button className="btn-icon" title="Edit" onClick={() => handleEditTask(task)}>✏️</button>
                                                        <button className="btn-icon danger" title="Delete" onClick={() => handleDeleteTask(task._id)}>🗑️</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                
                {activeTab === 'tasks' && (
                    <>
                        <div className="section-header">
                            <h2 className="section-title">All Tasks ({filteredTasks.length})</h2>
                            <button className="btn btn-primary btn-sm" onClick={handleCreateTask}>
                                ➕ New Task
                            </button>
                        </div>

                        
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="🔍 Search tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    padding: '10px 15px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-glass)',
                                    background: 'var(--bg-glass)',
                                    color: 'var(--text-primary)',
                                    flex: 1,
                                    minWidth: '200px',
                                    outline: 'none'
                                }}
                            />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={{
                                    padding: '10px 15px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-glass)',
                                    background: 'var(--bg-glass)',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="All" style={{ background: 'var(--bg-secondary)' }}>All Status</option>
                                <option value="Pending" style={{ background: 'var(--bg-secondary)' }}>Pending</option>
                                <option value="In Progress" style={{ background: 'var(--bg-secondary)' }}>In Progress</option>
                                <option value="Completed" style={{ background: 'var(--bg-secondary)' }}>Completed</option>
                            </select>
                        </div>

                        {filteredTasks.length === 0 ? (
                            <div className="empty-state">
                                <div className="icon">📭</div>
                                <h3>No tasks found</h3>
                                <p>Try changing your search terms or filters.</p>
                            </div>
                        ) : (
                            <div className="task-table-container">
                                <table className="task-table">
                                    <thead>
                                        <tr>
                                            <th>Task</th>
                                            <th>Priority</th>
                                            <th>Assigned To</th>
                                            <th>Status</th>
                                            <th>Deadline</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTasks.map((task) => (
                                            <tr key={task._id}>
                                                <td>
                                                    <div className="task-title-cell">{task.title}</div>
                                                    <div className="task-desc-cell">{task.description}</div>
                                                </td>
                                                <td>{getPriorityBadge(task.priority)}</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>
                                                    {task.assignedTo?.name || '—'}
                                                </td>
                                                <td>{getStatusBadge(task.status)}</td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                                    {formatDate(task.deadline)}
                                                </td>
                                                <td>
                                                    <div className="task-actions">
                                                        <button className="btn-icon" title="Edit" onClick={() => handleEditTask(task)}>✏️</button>
                                                        <button className="btn-icon danger" title="Delete" onClick={() => handleDeleteTask(task._id)}>🗑️</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                
                {activeTab === 'create' && (
                    <div style={{ textAlign: 'center', paddingTop: '40px' }}>
                        <div className="empty-state">
                            <div className="icon">➕</div>
                            <h3>Create a New Task</h3>
                            <p style={{ marginBottom: '20px' }}>Assign tasks to your team members</p>
                            <button className="btn btn-primary" onClick={handleCreateTask}>
                                ➕ Create Task
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {modalOpen && (
                <TaskModal
                    task={editingTask}
                    employees={employees}
                    onSave={handleSaveTask}
                    onClose={() => {
                        setModalOpen(false);
                        setEditingTask(null);
                    }}
                />
            )}
        </div>
    );
};

export default AdminDashboard;