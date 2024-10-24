// src/components/RarocCalculator.js

import React, { useState } from 'react';
import axiosInstance from './axios';
import './RarocCalculator.css'; // Ensure this CSS file exists and is imported

const RarocCalculator = () => {
    const [inputs, setInputs] = useState({});
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const segmentos = [
        'Avales y Garantias',
        'Banco de Desarrollo cuasi soberano',
        'Banco Comercial Sector Financiero',
        'Banco de Desarrollo Soberano',
        'Inversiones Patrimoniales',
        'PF Cuasi Soberano',
        'PF, Fondos de deuda, Corporativos y Otros No Soberano'
    ];

    const paises = [
        'Argentina',
        'Barbados',
        'Bolivia',
        'Brasil',
        'Chile',
        'Colombia',
        'Costa Rica',
        'Ecuador',
        'España',
        'Jamaica',
        'México',
        'Panamá',
        'Paraguay',
        'Perú',
        'Portugal',
        'República Dominicana',
        'Trinidad y Tobago',
        'Uruguay',
        'Venezuela',
        'Multinacional (al menos 2 países CAF)',
    ];

    const riesgoOperacion = [
        'Cuasi Soberano',
        'No Soberano',
        'Soberano'
    ];

    const calificacionExterna = [
        'Internacional',
        'Local',
        'No Tiene'
    ];

    const ratingCliente = [
        'AAA',
        'AA+',
        'AA',
        'AA-',
        'A+',
        'A',
        'A-',
        'BBB+',
        'BBB',
        'BBB-',
        'BB+',
        'BB',
        'BB-',
        'B+',
        'B',
        'B-',
        'CCC+',
        'CCC',
        'CCC-',
        'CC',
        'SD'
    ];

    const calificacionInterna = [
        '1 - SAT S o A',
        '2 - SAT MB o A',
        '3 - SAT A o B',
        '4 - WCH A o C',
        '5 - MEN',
        '6 - SUB',
        '7 - DUD',
        '8 - PER'
    ];

    const metodologiaPerdidaEsperadaOptions = [
        { value: 'perdida_esperada', label: 'Pérdida Esperada' },
        { value: 'previsiones', label: 'Previsiones' },
    ];

    const metodologiaCapitalOptions = [
        { value: 'sp', label: 'Standard & Poor’s' },
        { value: 'basilea', label: 'Basilea' },
        { value: 'perdida_no_esperada', label: 'Pérdida No Esperada' },
    ];

        const handleChange = (e) => {
        const { name, value } = e.target;

        let updatedInputs = {
            ...inputs,
            [name]: value
        };

        // Conditional logic to clear irrelevant fields
        if (name === 'segmento_operacion') {
            if (value === 'Inversiones Patrimoniales') {
                delete updatedInputs.corpestfin_spread_pb;
            } else {
                delete updatedInputs.patrimoniales_rentabilidad_esperada;
            }
        }

        setInputs(updatedInputs);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axiosInstance.post('raroc-calculator/', {
                operation_data: inputs,
                metodologia_perdida_esperada: inputs.metodologia_perdida_esperada,
                metodologia_capital: inputs.metodologia_capital,
            });
            setResult(response.data.raroc);
        } catch (err) {
            console.error('Error calculating RAROC:', err);
            setError(err.response?.data?.error || 'An error occurred');
        }
    };

    return (
        <div className="raroc-calculator">
            <h2>Calculadora RAROC</h2>
            <form onSubmit={handleSubmit}>
                {/* Segmento Operación */}
                <div className="form-group">
                    <label>Segmento:</label>
                    <select
                        name="segmento_operacion"
                        value={inputs.segmento_operacion || ''}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccionar</option>
                        {segmentos.map((segmento, index) => (
                            <option key={index} value={segmento}>
                                {segmento}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Metodología para Requerimientos de Capital */}
                <div className="form-group">
                    <label>Metodología para Requerimientos de Capital:</label>
                    <select
                        name="metodologia_capital"
                        value={inputs.metodologia_capital || ''}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccionar</option>
                        {metodologiaCapitalOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Metodología para Pérdida Esperada */}
                {inputs.segmento_operacion && inputs.segmento_operacion !== 'Inversiones Patrimoniales' && (
                    <div className="form-group">
                        <label>Metodología para Pérdidas Esperadas:</label>
                        <select
                            name="metodologia_perdida_esperada"
                            value={inputs.metodologia_perdida_esperada || ''}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccionar</option>
                            {metodologiaPerdidaEsperadaOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                {/* País */}
                {((inputs.segmento_operacion && inputs.segmento_operacion !== 'Inversiones Patrimoniales') ||
                    (inputs.metodologia_capital && inputs.metodologia_capital === "sp")) && (
                    <div className="form-group">
                        <label>País:</label>
                        <select
                            name="pais"
                            value={inputs.pais || ''}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccionar</option>
                            {paises.map((pais, index) => (
                                <option key={index} value={pais}>
                                    {pais}
                                </option>
                         ))}
                        </select>
                    </div>
                )}
                {/* Conditionally display Riesgo Operación */}
                {(inputs.segmento_operacion && inputs.segmento_operacion !== 'Inversiones Patrimoniales') &&
                    (inputs.metodologia_capital && inputs.metodologia_capital === "sp") && (
                    <div className="form-group">
                        <label>Riesgo:</label>
                        <select
                            name="corpestfin_riesgo"
                            value={inputs.corpestfin_riesgo || ''}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccionar</option>
                            {riesgoOperacion.map((riesgo, index) => (
                                <option key={index} value={riesgo}>
                                    {riesgo}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                {/* Calificación Externa Cliente */}
                {(inputs.metodologia_capital && inputs.metodologia_capital === "basilea") && (
                    <div className="form-group">
                        <label>Calificación Externa Cliente:</label>
                        <select
                            name="calificacion_externa_cliente"
                            value={inputs.calificacion_externa_cliente || ''}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccionar</option>
                            {calificacionExterna.map((calificacion, index) => (
                                <option key={index} value={calificacion}>
                                    {calificacion}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                {/* Conditionally display Rating Cliente or Calificación Interna Cliente */}
                {inputs.calificacion_externa_cliente && inputs.calificacion_externa_cliente !== 'No Tiene' && (
                    <div className="form-group">
                        <label>Rating Cliente:</label>
                        <select
                            name="rating_cliente"
                            value={inputs.rating_cliente || ''}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccionar</option>
                            {ratingCliente.map((rating, index) => (
                                <option key={index} value={rating}>
                                    {rating}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                {(inputs.segmento_operacion && inputs.segmento_operacion !== 'Inversiones Patrimoniales') ||
                    (inputs.calificacion_externa_cliente && inputs.calificacion_externa_cliente === 'No Tiene') ? (
                    <div className="form-group">
                        <label>Calificación Interna Cliente:</label>
                        <select
                            name="calificacion_interna_cliente"
                            value={inputs.calificacion_interna_cliente || ''}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccionar</option>
                            {calificacionInterna.map((calificacion, index) => (
                                <option key={index} value={calificacion}>
                                    {calificacion}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : null}
                {/* Exposición */}
                <div className="form-group">
                    <label>Exposición en miles:</label>
                    <input
                        type="number"
                        name="monto_miles"
                        value={inputs.monto_miles || ''}
                        onChange={handleChange}
                        required
                    />
                </div>
                {/* Plazo Operación */}
                <div className="form-group">
                    <label>Plazo en años:</label>
                    <input
                        type="number"
                        name="plazo_operacion"
                        value={inputs.plazo_operacion || ''}
                        onChange={handleChange}
                        required
                    />
                </div>
                {/* Conditionally display Meses de Gracia */}
                {inputs.segmento_operacion && inputs.segmento_operacion !== 'Inversiones Patrimoniales' && (
                    <div className="form-group">
                        <label>Meses de gracia:</label>
                        <input
                            type="number"
                            name="corpestfin_meses_gracia"
                            value={inputs.corpestfin_meses_gracia || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}
                {/* Conditionally display Spread or Rentabilidad Anual Esperada */}
                {inputs.segmento_operacion && inputs.segmento_operacion !== 'Inversiones Patrimoniales' && (
                    <div className="form-group">
                        <label>Spread en puntos básicos:</label>
                        <input
                            type="number"
                            name="corpestfin_spread_pb"
                            value={inputs.corpestfin_spread_pb || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}
                {inputs.segmento_operacion === 'Inversiones Patrimoniales' && (
                    <div className="form-group">
                        <label>Rentabilidad anual esperada en puntos básicos:</label>
                        <input
                            type="number"
                            name="patrimoniales_rentabilidad_esperada"
                            value={inputs.patrimoniales_rentabilidad_esperada || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}
                {/* Conditionally display Comisión de estructuración */}
                {inputs.segmento_operacion && inputs.segmento_operacion !== 'Inversiones Patrimoniales' && (
                    <div className="form-group">
                        <label>Comisión de estructuración en puntos básicos:</label>
                        <input
                            type="number"
                            name="corpestfin_comision_estructuracion"
                            value={inputs.corpestfin_comision_estructuracion || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}
                {/* Submit Button */}
                <button type="submit">Calcular RAROC</button>
            </form>
            {result !== null && (
                <div className="result">RAROC: {(result * 100).toFixed(2)}%</div>
            )}
            {error && <div className="error">{error}</div>}
        </div>
    );
};

export default RarocCalculator;

