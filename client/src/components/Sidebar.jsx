import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, onTabChange, sidebarOpen, onCloseSidebar }) => {
    const { user, logout } = useAuth();

    const adminLinks = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'tasks', label: 'All Tasks', icon: '📋' },
        { id: 'create', label: 'Create Task', icon: '➕' },
    ];

    const employeeLinks = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'tasks', label: 'My Tasks', icon: '📋' },
    ];

    const links = user?.role === 'admin' ? adminLinks : employeeLinks;

    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            {sidebarOpen && <div className="sidebar-backdrop" onClick={onCloseSidebar}></div>}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <div className="logo-icon">⚡</div>
                        <span className="logo-text">TaskFlow</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-section-title">Navigation</div>
                    {links.map((link) => (
                        <button
                            key={link.id}
                            className={`sidebar-link ${activeTab === link.id ? 'active' : ''}`}
                            onClick={() => {
                                onTabChange(link.id);
                                onCloseSidebar();
                            }}
                        >
                            <span className="icon">{link.icon}</span>
                            {link.label}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">{getInitials(user?.name)}</div>
                        <div className="user-details">
                            <div className="user-name">{user?.name}</div>
                            <div className="user-role">{user?.role}</div>
                        </div>
                    </div>
                    <button className="sidebar-link" onClick={logout}>
                        <span className="icon">🚪</span>
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
