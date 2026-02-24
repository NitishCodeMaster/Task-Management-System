 import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

const HomeRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading-spinner" style={{ margin: '40vh auto' }}></div>;
    if (!user) return <Navigate to="/login" replace />;
    return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#1a1a2e',
                            color: '#e8e8f0',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }
                    }} 
                />
                <Routes>
                    <Route path="/" element={<HomeRedirect />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin" element={
                        <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
                    } />
                    <Route path="/employee" element={
                        <ProtectedRoute requiredRole="employee"><EmployeeDashboard /></ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;