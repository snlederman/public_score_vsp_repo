// src/components/ProtectedRoute.js

import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axiosInstance from './axios';

function ProtectedRoute({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axiosInstance.get('check-auth/');
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Authentication failed:', error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return <div>Loading, please wait...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

export default ProtectedRoute;