import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider'; // Import the custom hook

const ProtectedRoute = ({ children }) => {
    const currentUser = useAuth();

    if (currentUser === null) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;