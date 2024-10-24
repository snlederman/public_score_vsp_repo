// Login.js
import React, { useState } from 'react';
import axiosInstance from './axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Reset error message before new attempt
        setIsLoading(true);

        try {
            const response = await axiosInstance.post('token/', {
                username,
                password,
            });
            console.log('Login Response:', response.data); // Log the response

            if (response.status === 200) {
                // Tokens are set in HttpOnly cookies by the backend
                navigate('/'); // Redirect to the main page
            } else {
                setError('Login failed.');
            }
        } catch (error) {
            // Instead of using the backend's error message, set a custom message
            setError('Login failed. Please check your username and password.');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false); // Optional: End loading
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            <p>
                Don't have an account? <Link to="/signup">Sign up here</Link>
            </p>
            <p>
                <Link to="/password-reset">Forgot Password?</Link> {/* Added Forgot Password link */}
            </p>
        </div>
    );
}

export default Login;