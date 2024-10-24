// Signup.js
import React, { useState } from 'react';
import axiosInstance from './axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic client-side validation
        if (!username || !password || !email) {
            setError('All fields are required.');
            return;
        }
        if (!email.endsWith('@caf.com')) {
            setError('Email must end with @caf.com');
            return;
        }

        try {
            const response = await axiosInstance.post('signup/', {
                username,
                password,
                email,
            });

            console.log('Response:', response);  // Log the entire response object

            if (response && response.status === 201) {
                alert("Signup successful! Please check your email to verify your account.");
                navigate('/login'); // Redirect to login page
            } else {
                console.error('Unexpected response:', response);
                setError('Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Signup failed:', error);
            if (error.response) {
                // Log the specific error response from the server
                console.error('Error response data:', error.response.data);
                setError(error.response.data.error || 'Signup failed. Please try again.');
            } else {
                setError('Signup failed. Please try again.');
            }
        }
    };

    return (
        <div>
            <h2>Signup</h2>
            {error && <p>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button type="submit">Signup</button>
            </form>
        </div>
    );
}

export default Signup;