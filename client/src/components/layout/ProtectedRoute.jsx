import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a Spinner component
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    const isAdmin = user.role === 'admin' || user.role === 'Administrator';
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
