import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const EmployeeDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Search and Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [statsRes, tasksRes] = await Promise.all([
                api.get('/dashboard'),
                api.get('/tasks'),
            ]);
            setStats(statsRes.data);
            setTasks(tasksRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            fetchData();
        } catch (err) {
            console.error('Failed to update status:', err);
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
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const isOverdue = (deadline, status) => {
        if (status === 'Completed') return false;
        return new Date(deadline) < new Date();
    };

    // Filter Logic
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
                    {activeTab === 'dashboard' ? 'My Dashboard' : 'My Tasks'}
                </span>
                <div className="navbar-actions"></div>
            </div>

            <main className="main-content">
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && stats && (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card purple">
                                <div className="stat-icon">📋</div>
                                <div className="stat-value">{stats.myTasks}</div>
                                <div className="stat-label">My Tasks</div>
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
                                <div className="stat-icon">🚀</div>
                                <div className="stat-value">{stats.inProgressTasks}</div>
                                <div className="stat-label">In Progress</div>
                            </div>
                        </div>

                        <div className="section-header">
                            <h2 className="section-title">Recent Tasks</h2>
                        </div>

                        {tasks.length === 0 ? (
                            <div className="empty-state">
                                <div className="icon">🎉</div>
                                <h3>No tasks assigned</h3>
                                <p>You're all caught up! Check back later for new assignments.</p>
                            </div>
                        ) : (
                            <div className="task-cards-grid">
                                {tasks.slice(0, 4).map((task) => (
                                    <div key={task._id} className="task-card">
                                        <div className="task-card-header">
                                            <h3 className="task-card-title">{task.title}</h3>
                                            {getPriorityBadge(task.priority)}
                                        </div>
                                        {task.description && (
                                            <p className="task-card-desc">{task.description}</p>
                                        )}
                                        <div className="task-card-meta">
                                            {getStatusBadge(task.status)}
                                        </div>
                                        <div className="task-card-footer">
                                            <span className={`task-card-deadline ${isOverdue(task.deadline, task.status) ? 'overdue' : ''}`}>
                                                📅 {formatDate(task.deadline)}
                                                {isOverdue(task.deadline, task.status) && ' (Overdue)'}
                                            </span>
                                            <select
                                                className="status-select"
                                                value={task.status}
                                                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Tasks Tab (With Search & Filter) */}
                {activeTab === 'tasks' && (
                    <>
                        <div className="section-header">
                            <h2 className="section-title">All My Tasks ({filteredTasks.length})</h2>
                        </div>

                        {/* Search & Filter Controls */}
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
                                <div className="icon">🎉</div>
                                <h3>No matching tasks found</h3>
                                <p>You're all caught up with these filters!</p>
                            </div>
                        ) : (
                            <div className="task-cards-grid">
                                {filteredTasks.map((task) => (
                                    <div key={task._id} className="task-card">
                                        <div className="task-card-header">
                                            <h3 className="task-card-title">{task.title}</h3>
                                            {getPriorityBadge(task.priority)}
                                        </div>
                                        {task.description && (
                                            <p className="task-card-desc">{task.description}</p>
                                        )}
                                        <div className="task-card-meta">
                                            {getStatusBadge(task.status)}
                                        </div>
                                        <div className="task-card-footer">
                                            <span className={`task-card-deadline ${isOverdue(task.deadline, task.status) ? 'overdue' : ''}`}>
                                                📅 {formatDate(task.deadline)}
                                                {isOverdue(task.deadline, task.status) && ' (Overdue)'}
                                            </span>
                                            <select
                                                className="status-select"
                                                value={task.status}
                                                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default EmployeeDashboard;