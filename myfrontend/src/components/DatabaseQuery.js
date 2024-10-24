import React, { useState } from 'react';
import axiosInstance from './axios';
import './DatabaseQuery.css';

const DatabaseQuery = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post('nl-query/', { question: input });
      setResponse(res.data.result);
      setQuery(res.data.query);  // Muestra también el query generado
      setError(null);
    } catch (err) {
      setError('Error al procesar la consulta.');
      setResponse('');
      setQuery('');
    } finally {
      console.log('Finalizó la consulta.');
      setLoading(false);  // Desactivar el estado de carga cuando termina la consulta
    }
  };

  return (
    <div className="nl-query-container">
      <h1>Consulta a la base de datos</h1>
      <form onSubmit={handleSubmit} className="query-form">
        <textarea
          className="query-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Haz tu pregunta en lenguaje natural"
          rows="4"
        />
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Consultando...' : 'Consultar'}
        </button>
      </form>

      {loading && <div className="loading">Generando respuesta, por favor espera...</div>}

      {query && (
        <div className="query-display">
          <strong>Consulta SQL Generada:</strong> <pre>{query}</pre>
        </div>
      )}

      {response && (
        <div className="response">
          <strong>Respuesta:</strong> {response}
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default DatabaseQuery;