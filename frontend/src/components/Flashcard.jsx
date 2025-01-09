import { Card } from '@mui/material';
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = () => {
    const { currentUser } = useAuth();

    if (currentUser === null) {
        return <Navigate to="/login" />;
    }

    return(
        <Card>
            
        </Card>
    );
};

export default ProtectedRoute;