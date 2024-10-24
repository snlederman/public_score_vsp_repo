import React from 'react';
import { Link } from 'react-router-dom';
import Logout from './Logout';
import './PrincipalPage.css';

const PrincipalPage = () => {
    return (
        <div className="principal-page">
            <h1>Bienvenido a la herramienta de priorización de operaciones</h1>
            <div className="links">
                <Link to="/form" className="link-button">Ir a la Forma</Link>
                <Link to="/dashboard" className="link-button">Ir al Dashboard</Link>
                <Link to="/nl-query" className="link-button">Ir a Consulta</Link>
                <Link to="/raroc-calculator" className="link-button">Ir al Calculador RAROC</Link>
                <Logout />
            </div>
        </div>
    );
};

export default PrincipalPage;