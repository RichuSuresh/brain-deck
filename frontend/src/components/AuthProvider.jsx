import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import {auth} from '../constants';

// Create a UserContext to provide user info to the app
const UserContext = createContext(null);

export const useAuth = () => {
    return useContext(UserContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user ? { ...user } : null);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <UserContext.Provider value={{currentUser}}>
            {children}
        </UserContext.Provider>
    );
};
