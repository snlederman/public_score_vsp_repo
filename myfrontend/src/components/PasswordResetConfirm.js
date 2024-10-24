// src/components/PasswordResetConfirm.js

import React, { useState } from 'react';
import axiosInstance from './axios';
import { useParams, useNavigate } from 'react-router-dom';

function PasswordResetConfirm() {
    const { uidb64, token } = useParams(); // Extract uid and token from URL
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordResetConfirm = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== password2) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axiosInstance.post('/password-reset/confirm/', {
                uidb64: uidb64,
                token: token,
                password: password,
                password2: password2,
            });
            setMessage('Your password has been reset successfully. You can now log in with your new password.');
            // Optionally, redirect to login after a delay
            setTimeout(() => {
                navigate('/login');
            }, 5000);
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.message || 'An error occurred. Please try again.');
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2>Reset Password</h2>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handlePasswordResetConfirm}>
                <div>
                    <label>New Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Confirm New Password:</label>
                    <input
                        type="password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
}

export default PasswordResetConfirm;