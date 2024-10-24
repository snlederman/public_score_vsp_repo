import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup'; // Import the Signup component
import PasswordResetRequest from './components/PasswordResetRequest';
import PasswordResetConfirm from './components/PasswordResetConfirm';
import ProtectedRoute from './components/ProtectedRoute';
import PrincipalPage from './components/PrincipalPage';
import OperationForm from './components/OperationForm';
import SupersetDashboard from './components/SupersetDashboard';
import DatabaseQuery from './components/DatabaseQuery';
import RarocCalculator from './components/RarocCalculator';
import './styles.css';

function App() {
    return (
        <Router>
            <div className="App">
                <div className="container">
                    <header className="App-header">
                        <img src="/prueba.png" alt="Header Image" />
                    </header>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} /> {/* Add Signup route */}
                        <Route path="/password-reset" element={<PasswordResetRequest />} />
                        <Route path="/password-reset-confirm/:uidb64/:token" element={<PasswordResetConfirm />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <PrincipalPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/form"
                            element={
                                <ProtectedRoute>
                                    <OperationForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <SupersetDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/nl-query"
                            element={
                                <ProtectedRoute>
                                    <DatabaseQuery />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/raroc-calculator"
                            element={
                                <ProtectedRoute>
                                    <RarocCalculator />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;