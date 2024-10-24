// src/components/Logout.js

import React from 'react';
import axiosInstance from './axios';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await axiosInstance.post('logout/');
            if (response.status === 200) {
                navigate('/login');
            } else {
                alert("Logout failed.");
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert("Logout failed.");
        }
    };

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    );
};

export default Logout;