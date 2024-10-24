// src/components/OperationForm.js
import React, { useState, useEffect } from 'react';
import axiosInstance from './axios';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './OperationForm.css';

const getDefaultOperation = () => ({
    link_portal_negocio: '',
    ejecutivo_negocio: '',
    nombre_cliente: '',
    nombre_operacion: '',
    pais: '',
    instrumento_financiero: '',
    tipo_cliente: '',
    estructurado_contratacion_ingresos: '',
    estructurado_capex_garantizado: '',
    estructurado_financiamiento_identificado: '',
    estructurado_permisos: '',
    estructurado_estructura_ingresos: '',
    estructurado_ingresos_publicos: '',
    monto_miles: '',
    moneda_local: '',
    calificacion_externa_cliente: '',
    rating_cliente: '',
    calificacion_interna_cliente: '',
    necesidad_cliente: '',
    competitividad_caf: '',
    experiencia_caf: '',
    descripcion: '',
    actividad_principal: '',
    segmento_operacion: '',
    sector_economico: '',
    sub_sector_economico: '',
    area_actuacion: '',
    agendas_misionales: '',
    agendas_transversales_verdes: '',
    agendas_transversales_b4: '',
    agendas_transversales_b5: '',
    agendas_transversales_b6: '',
    ods_1: '',
    ods_2: '',
    ods_3: '',
    ods_4: '',
    adicionalidad_cubrir_brechas: '',
    adicionalidad_mitigar_riesgos: '',
    adicionalidad_mejorar_condiciones: '',
    adicionalidad_movilizar_recursos: '',
    adicionalidad_instrumento_innovador: '',
    adicionalidad_conocimiento: '',
    fecha_tentativa_desembolso: '',
    plazo_operacion: '',
    corpestfin_riesgo: '',
    corpestfin_spread_pb: '',
    corpestfin_meses_gracia: '',
    corpestfin_comision_estructuracion: '',
    corpestfin_comision_anual: '',
    patrimoniales_rentabilidad_esperada: '',
    patrimoniales_tipo_fondo: '',
    corpestfin_robustez_cliente: '',
    corpfin_robustez_gerencia: '',
    corpfin_robustez_posicion_mercado: '',
    corporativo_robustez_razon_liquidez: '',
    corporativo_robustez_estructura_financiera: '',
    corporativo_robustez_ffo: '',
    estructurado_experiencia_epecista: '',
    estructurado_experiencia_operador: '',
    financieras_robustez_razon_liquidez: '',
    financieras_morosidad: '',
    financieras_solvencia: '',
    patrimoniales_antecedentes_gestor: '',
    patrimoniales_experiencia_sector: '',
    patrimoniales_experiencia_region: '',
    patrimoniales_experiencia_equipo: '',
});

const fieldLabels = {
    link_portal_negocio: 'Link portal del negocio',
    ejecutivo_negocio: 'Ejecutivo de negocio',
    nombre_cliente: 'Nombre del cliente',
    nombre_operacion: 'Nombre de la operación',
    pais: 'País de la operación',
    instrumento_financiero: 'Instrumento financiero de la operación',
    tipo_cliente: 'Tipo de cliente',
    estructurado_contratacion_ingresos: 'Estado de contratación de los ingresos de la operación',
    estructurado_capex_garantizado: '¿La operación tiene garantizado el CAPEX?',
    estructurado_financiamiento_identificado: '¿La operación tiene financiamiento identificado adicionalmente a participación de CAF?',
    estructurado_permisos: 'Estado de los permisos y terrenos de la operación',
    estructurado_estructura_ingresos: 'Tipo de estructura de ingresos de la operación',
    estructurado_ingresos_publicos: 'Ingresos contratados de la operación provenientes de la administración pública',
    monto_miles: 'Monto de la operación en miles',
    moneda_local: '¿La operación es en moneda local?',
    calificacion_externa_cliente: 'Calificación externa del cliente',
    rating_cliente: 'Rating del cliente',
    calificacion_interna_cliente: 'Calificación interna del cliente',
    necesidad_cliente: 'Interés/Necesidad del cliente en concretar la operación',
    competitividad_caf: '¿Es CAF competitivo financieramente (respecto al mercado) en monto, plazo y/o tasa?',
    experiencia_caf: '¿Es una operación conocida para CAF en términos de instrumento, mercado y/o segmento?',
    descripcion: 'Descripción de la operación',
    actividad_principal: 'Actividad principal de la operación',
    segmento_operacion: 'Segmento de la operación',
    sector_economico: 'Sector económico de la operación',
    sub_sector_economico: 'Sub sector económico de la operación',
    area_actuacion: 'Área de actuación de la operación',
    agendas_misionales: 'Agendas misionales de la operación',
    agendas_transversales_verdes: '¿La operación califica en la agenda de operaciones más verdes?',
    agendas_transversales_b4: '¿La operación aborda aspectos de género, inclusión y/o diversidad?',
    agendas_transversales_b5: '¿La operación promueve la integración regional?',
    agendas_transversales_b6: '¿La operación impulsa alianzas y movilización de recursos?',
    ods_1: 'ODS 1',
    ods_2: 'ODS 2',
    ods_3: 'ODS 3',
    ods_4: 'ODS 4',
    adicionalidad_cubrir_brechas: '¿La presencia de CAF en la operación permite cubrir una brecha de financiamiento?',
    adicionalidad_mitigar_riesgos: '¿La presencia de CAF mitiga el riesgo y hace el proyecto más atractivo a los inversionistas?',
    adicionalidad_mejorar_condiciones: '¿CAF mejora las condiciones financieras ofrecidas por el sistema financiero (plazo, tasa)?',
    adicionalidad_movilizar_recursos: '¿CAF permite al cliente movilizar otras fuentes de recursos financieros?',
    adicionalidad_instrumento_innovador: '¿La estructuración de la operación por parte de CAF permite introducir una estructura o instrumento financiero innovador?',
    adicionalidad_conocimiento: '¿La estructuración de la operación por parte de CAF aporta conocimiento/innovación y mejoras en otras áreas en/con la operación?',
    fecha_tentativa_desembolso: 'Fecha tentativa de desembolso de la operación',
    plazo_operacion: 'Plazo de la operación en años',
    corpestfin_riesgo: 'Tipo de riesgo de la operación',
    corpestfin_spread_pb: 'Spread en puntos básicos de la operación',
    corpestfin_meses_gracia: 'Meses de gracia de la operación',
    corpestfin_comision_estructuracion: 'Comisión de estructuración de la operación',
    corpestfin_comision_anual: 'Comisión anual de la operación',
    patrimoniales_rentabilidad_esperada: 'Rentabilidad anual esperada de la operación',
    patrimoniales_tipo_fondo: 'Tipo de fondo de la operación',
    corpestfin_robustez_cliente: 'Situación financiera del cliente',
    corpfin_robustez_gerencia: 'Calidad de la administración y gerencia del cliente',
    corpfin_robustez_posicion_mercado: 'Posición de mercado del cliente',
    corporativo_robustez_razon_liquidez: 'Razón de liquidez del cliente',
    corporativo_robustez_estructura_financiera: 'Estructura financiera del cliente',
    corporativo_robustez_ffo: 'Flujo de caja operativo - cobertura (FFO/ Servicio de deuda) del cliente',
    estructurado_experiencia_epecista: 'Experiencia del epecista (Proyectos en el país, región o sector)',
    estructurado_experiencia_operador: 'Experiencia del operador (Proyectos en el país, región o sector)',
    financieras_robustez_razon_liquidez: 'Razón de liquidez del cliente',
    financieras_morosidad: 'Morosidad del cliente',
    financieras_solvencia: 'Solvencia del cliente',
    patrimoniales_antecedentes_gestor: 'Antecedentes del gestor',
    patrimoniales_experiencia_sector: 'Experiencia del gestor en el sector',
    patrimoniales_experiencia_region: 'Experiencia del gestor en la región',
    patrimoniales_experiencia_equipo: 'Experiencia del gestor como equipo',
};

const OperationForm = () => {
    const [operation, setOperation] = useState(getDefaultOperation());
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [operations, setOperations] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [subSectors, setSubSectors] = useState([]);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showAdditionalFields, setShowAdditionalFields] = useState({
        corporativo: false,
        estructurado: false,
        financieras: false,
        patrimoniales: false,
        corporativo_estructurado_financieras: false,
        corporativo_financieras: false,
    });

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
        'Multinacional (al menos 2 países CAF)'
    ];

    const instrumentosFinancieros = [
        'Avales y Garantias',
        'Inversiones Patrimoniales',
        'Línea de Crédito',
        'Préstamos Corporativos',
        'Programas y Proyectos de Inversión (PPI)'
    ];

    const clientes = [
        'Corporativo',
        'Financiamiento Estructurado',
        'Instituciones Financieras',
        'Inversiones Patrimoniales'
    ];

    const contratacionIngresos = [
        'Tiene PPA firmado',
        'Mou',
        'En negociación',
        'No tiene'
    ];

    const binario = [
        'Si',
        'No'
    ];

    const permisos = [
        'Tienen todos los permisos',
        'Marco regulatorio desarrollado',
        'Tiene los terrenos',
        'No tiene'
    ];

    const estructuraIngresos = [
        'Contratados',
        'Mercado'
    ];

    const porcentajeIngresosPublicos = [
        '76% a 100%',
        '51% a 75%',
        '25% a 50%',
        '0% a 25%',
        '0%'
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
        '8 - PER',
    ];

    const necesidadCliente = [
        'Alto',
        'Medio/Alto',
        'Medio',
        'Bajo',
        'Nulo'
    ];

    const madurez = [
        '3 de 3',
        '2 de 3',
        '1 de 3',
        'No'
    ];

    const actividadesPrincipales = [
        'Conservación de Bosques',
        'Construcción de plantas de biomasa (bagazo)',
        'Desarrollo de infraestructura TICs',
        'Eficiencia Energética',
        'Enfoques top-down y bottom-up de servicios de agua, saneamiento y electricidad en asentamientos informales' +
        ' o de bajos ingresos',
        'Explotación de eucalipto',
        'Financiamiento a Microempresas (visión de género)',
        'Financiamiento a Pymes / Garantías',
        'Financiamiento de construcción de líneas de metro',
        'Financiamiento de construcción de puertos',
        'Financiamiento de Educación Superior',
        'Financiamiento de infraestructura de irrigación',
        'Financiamiento de infraestructura educativa',
        'Financiamiento para construcción ferroviaria',
        'Financiamiento Verde',
        'Fintech',
        'Generación de electricidad mediante páneles solares',
        'Reciclaje de Plástico',
        'Vialidad',
        'Otros'
    ];

    const segmentos = [
        'Avales y Garantias',
        'Banco de Desarrollo cuasi soberano',
        'Banco Comercial Sector Financiero',
        'Banco de Desarrollo Soberano',
        'Inversiones Patrimoniales',
        'PF Cuasi Soberano',
        'PF, Fondos de deuda, Corporativos y Otros No Soberano'
    ];

    const sectoresEconomicos = [
        'Administración pública',
        'Agricultura ganadería pesca y silvicultura',
        'Agua saneamiento preservación de recursos hídricos y gestión de residuos',
        'Educación cultura y deporte',
        'Energía e industrias extractivas',
        'Industria comercio y servicios',
        'Protección y servicios sociales',
        'Salud',
        'Sector financiero',
        'Tecnologías de la información y la comunicación',
        'Transporte',
        'Transversal'
    ];

    const subSectoresEconomicos = {
        'Administración pública':
            [
                'Gobierno central',
                'Gobierno subnacional',
                'GovTech',
                'Otros - Gob',
                'NA'
            ],
        'Agricultura ganadería pesca y silvicultura':
            [
                'Agricultura, ganadería, pesca y silvicultura',
                'Irrigación',
                'Otros - Agricultura',
                'NA'
            ],
        'Agua saneamiento preservación de recursos hídricos y gestión de residuos':
            [
                'Agua, saneamiento, preservación de recursos hídricos y gestión de residuos'
            ],
        'Educación cultura y deporte':
            [
                'Cultura',
                'Deporte',
                'Educación',
                'Infraestructura educativa',
                'Otros - Educación',
                'NA'
            ],
        'Energía e industrias extractivas':
            [
                'Gas',
                'Generación de energía no renovable',
                'Generación de energía renovable (hidroeléctrica, solar, eólica, biomasa, geotérmica)',
                'Minería',
                'Petróleo',
                'Otros - Energía',
                'NA'
            ],
        'Industria comercio y servicios':
            [
                'Comercio',
                'Construcción',
                'Hotelería y turismo',
                'Manufactura',
                'Servicios',
                'Otros - Industria',
                'NA'
            ],
        'Protección y servicios sociales':
            [
                'Desarrollo urbano',
                'Protección social',
                'Otros - Servicios Sociales',
                'NA'
            ],
        'Salud':
            [
                'Infraestructura de salud',
                'Salud',
                'Otros - Salud',
                'NA'
            ],
        'Sector financiero':
            [
                'Banca comercial',
                'Banca de desarrollo',
                'FinTech',
                'Microfinanzas',
                'Otros - Finc',
                'NA'
            ],
        'Tecnologías de la información y la comunicación':
            [
                'Tecnologías de la información y la comunicación',
                'NA'
            ],
        'Transporte':
            [
                'Transporte',
                'NA'
            ],
        'Transversal':
            [
                'NA'
            ]
    };

    const areasActuacion = [
        'Apoyo a empresas privadas o públicas que presten/desarrollen bienes o servicios públicos',
        'Desarrollo del mercado financiero',
        'Inclusión digital de personas y empresas',
        'Inclusión financiera de personas y empresas',
        'Infraestructura para la adaptación al CC',
        'Infraestructura para la mitigación del cambio climático',
        'Innovación empresarial y tecnológica',
        'Integración comercial regional y global',
        'Mercados de Carbonos',
        'Productividad de las pymes',
        'Transformación productiva hacia modelos limpios',
        'Uso y aprovechamiento sostenible de recursos naturales',
        'Otros'
    ];

    const agendasMisionales = [
        'A1. Transición Enerética justa',
        'A2. Biodiversisdad y servicios Ecosistemicos',
        'A3. Territorios resilientes',
        'A4. Bienestar Social Inclusivo',
        'A5. Infraestructura Fisica y Digital',
        'A6. Productividad e internacionalización'
    ];

    const agendasTransversalesB4 = [
        'Fortalecimiento institucional en GID',
        'Indicadores beneficiarias grupo meta GID',
        'Recursos o medidas para el grupo meta GID',
        'No existe evidencia o interés en el abordaje'
    ];

    const agendasTransversalesB5 = [
        'más de 3 países ',
        '3 países',
        '2 países',
        'No'
    ];

    const agendasTransversalesB6 = [
        'Por encima de 4x',
        'de 2,01x a 4x',
        'de 1,00x a 2x',
        'de 0,01 a 0,99x',
        'Cero'
    ];

    const objetivosDesarrolloSostenible = [
        {value: '1', text: 'ODS 1', definition: 'Poner fin a la pobreza en todas sus formas y en todo el mundo'},
        {value: '2', text: 'ODS 2', definition: 'Poner fin al hambre, lograr la seguridad alimentaria y la mejora de la' +
                ' nutrición y promover la agricultura sostenible'},
        {value: '3', text: 'ODS 3', definition: 'Garantizar una vida sana y promover el bienestar de todos a todas' +
                ' las edades'},
        {value: '4', text: 'ODS 4', definition: 'Garantizar una educación inclusiva y equitativa de calidad y promover' +
                ' oportunidades de aprendizaje permanente para todos'},
        {value: '5', text: 'ODS 5', definition: 'Lograr la igualdad de género y empoderar a todas las mujeres y' +
                ' las niñas'},
        {value: '6', text: 'ODS 6', definition: 'Garantizar la disponibilidad y la gestión sostenible del agua y el' +
                ' saneamiento para todos'},
        {value: '7', text: 'ODS 7', definition: 'Garantizar el acceso a una energía asequible, fiable, sostenible y' +
                ' moderna para todos'},
        {value: '8', text: 'ODS 8', definition: 'Promover el crecimiento económico sostenido, inclusivo y sostenible,' +
                ' el empleo pleno y productivo y el trabajo decente para todos'},
        {value: '9', text: 'ODS 9', definition: 'Construir infraestructuras resilientes, promover la industrialización' +
                ' inclusiva y sostenible y fomentar la innovación'},
        {value: '10', text: 'ODS 10', definition: 'Reducir la desigualdad en los países y entre ellos'},
        {value: '11', text: 'ODS 11', definition: 'Lograr que las ciudades y los asentamientos humanos sean inclusivos,' +
                ' seguros, resilientes y sostenibles'},
        {value: '12', text: 'ODS 12', definition: 'Garantizar modalidades de consumo y producción sostenibles'},
        {value: '13', text: 'ODS 13', definition: 'Adoptar medidas urgentes para combatir el cambio climático y' +
                ' sus efectos'},
        {value: '14', text: 'ODS 14', definition: 'Conservar y utilizar sosteniblemente los océanos, los mares y los' +
                ' recursos marinos para el desarrollo sostenible'},
        {value: '15', text: 'ODS 15', definition: 'Proteger, restablecer y promover el uso sostenible de los ecosistemas' +
                ' terrestres, gestionar sosteniblemente los bosques, luchar contra la desertificación, detener e' +
                ' invertir la degradación de las tierras y detener la pérdida de biodiversidad'},
        {value: '16', text: 'ODS 16', definition: 'Promover sociedades pacíficas e inclusivas para el desarrollo' +
                ' sostenible, facilitar el acceso a la justicia para todos y construir a todos los niveles' +
                ' instituciones eficaces e inclusivas que rindan cuentas'},
        {value: '17', text: 'ODS 17', definition: 'Fortalecer los medios de implementación y revitalizar la Alianza' +
                ' Mundial para el Desarrollo Sostenible'}
    ];

    const riesgoOperacion = [
        'Cuasi Soberano',
        'No Soberano',
        'Soberano'
    ];

    const tipoFondo = [
        'Venture Capital',
        'Fondo Infraestructura',
        'Private Equity'
    ];

    const gerencia = [
        '1. Administración excelente con antecedentes sólidos en su sector. Resultados positivos consistentes y un' +
        ' equipo gerencial estable, comprometido y bien incentivado.',
        '2. Administración buena con antecedentes sólidos en su sector. Resultados satisfactorios, capacidad' +
        ' y visión. Equipo gerencial estable en general.',
        '3. Administración buena con antecedentes buenos en su sector. Equipo gerencial estable en posiciones ' +
        'relevantes.',
        '4. Administración estable con antecedentes moderados en su sector y capacidad para sortear eventos externos.' +
        ' Equipo gerencial con carencias puntuales.',
        '5. Administración con carencias y experiencia escasa en el sector. Resultados oscilantes y dificultades en' +
        ' gestionar eventos. Cambios frecuentes en el equipo gerencial.',
        '6. Administración con carencias significativas en áreas clave. Resultados negativos debido a decisiones' +
        ' gerenciales desacertadas o incapacidad en gestionar eventos.',
        '7. Administración deficiente. Resultados consistentemente negativos. Requiere un relevamiento completo del' +
        ' equipo gerencial.',
        '8. El cliente se encuentra en situación de incumplimiento real o inminente de sus obligaciones financieras' +
        ' con CAF.'
    ];

    const posicionMercado = [
        '1. Posición dominante en el mercado, contando con ventajas competitivas y posee barreras de entradas' +
        ' naturales o legales.',
        '2. Participación significativa en su mercado objetivo contando con ventajas competitivas.',
        '3. Participación relevante en su mercado objetivo.',
        '4. Participación marginal en su mercado objetivo.'
    ];

    const robustezCliente = [
        '1. Muy solida situación financiera. Inversión estratégica y relevante en el portafolio del accionista.' +
        ' Reinvierte utilidades.',
        '2. Solida situación financiera. Inversión relevante y estratégica en el portafolio.',
        '3. Situación financiera saneada. Inversión de relevancia moderada en el portafolio del accionista.',
        '4. Situación financiera debil. Inversión de relevancia  moderada para el accionista.',
        '5. Situación financiera deteriorada sin capacidad de aportar recursos financieros.'
    ];

    const razonLiquidezCorporativo = [
        '1. Razon corriente mayor o igual a 2',
        '2. Razon Corriente mayor o igual a 1,5',
        '3. Razón corriente mayor o igual a 1',
        '4. Razon corriente menor a 1 y requiere incrementos de deuda para financiar brecha'
    ];

    const razonLiquidezFinancieras = [
        '1. LCR mayor o igual a 2',
        '2. LCR mayor o igual a 1,5',
        '3. LCR mayor o igual a 1',
        '4. LCR menor a 1 y requiere incrementos de deuda para financiar brecha'
    ];

    const estructuraFinanciera = [
        '1. Patrimonio/ Activos mayor a 50%',
        '2. Patrimonio/ Activos mayor a 40%',
        '3. Patrimonio/ Activos mayor a 30%',
        '4. Patrimonio/ Activos menor a 30%'
    ];

    const coberturaFlujoCaja = [
        '1. Mayor a 1,5x',
        '2. Entre 1,3x y 1,5x',
        '3. Entre 1,1x y 1,3x',
        '4. Mayor a 1',
        '5. Inferior a 1'
    ];

    const antecedentesGestor = [
        '1 - Gestor top tier',
        '2- Al menos dos fondos con buen track record',
        '3- Al menos un fondo con buen track record/Primer fondo de la gestora, pero con excelente track' +
        ' record previo',
        '4 - Fondos anteriores pero con track record malo/promedio',
        '5 - First Time manager'
    ];

    const experiencia = [
        'Alta',
        'Media',
        'Baja'
    ];

    const nivel = [
        'Muy buena',
        'Por encima del mercado',
        'En linea con el mercado',
        'Por debajo del mercado'
    ];

    useEffect(() => {
        // Fetch existing operations to populate the dropdown
        axiosInstance.get('operations/')
            .then(response => {
                console.log('API Response:', response.data); // Log API response
                setOperations(response.data);
            })
            .catch(error => console.error('Error fetching operations:', error));
    }, []);

    const handleSelectChange = (e) => {
        const selectedId = e.target.value;
        setSelectedId(selectedId);

        if (selectedId) {
            const selectedOperation = operations.find(op => op.id === parseInt(selectedId));
            if (selectedOperation) {
                console.log('Selected Operation:', selectedOperation);
                setOperation({
                    ...selectedOperation,
                    corporativo_robustez_razon_liquidez: selectedOperation.corporativo?.corporativo_robustez_razon_liquidez || '',
                    corporativo_robustez_estructura_financiera: selectedOperation.corporativo?.corporativo_robustez_estructura_financiera || '',
                    corporativo_robustez_ffo: selectedOperation.corporativo?.corporativo_robustez_ffo || '',
                    estructurado_contratacion_ingresos: selectedOperation.financiamientoestructurado?.estructurado_contratacion_ingresos || '',
                    estructurado_capex_garantizado: selectedOperation.financiamientoestructurado?.estructurado_capex_garantizado || '',
                    estructurado_financiamiento_identificado: selectedOperation.financiamientoestructurado?.estructurado_financiamiento_identificado || '',
                    estructurado_permisos: selectedOperation.financiamientoestructurado?.estructurado_permisos || '',
                    estructurado_estructura_ingresos: selectedOperation.financiamientoestructurado?.estructurado_estructura_ingresos || '',
                    estructurado_ingresos_publicos: selectedOperation.financiamientoestructurado?.estructurado_ingresos_publicos || '',
                    estructurado_experiencia_epecista: selectedOperation.financiamientoestructurado?.estructurado_experiencia_epecista || '',
                    estructurado_experiencia_operador: selectedOperation.financiamientoestructurado?.estructurado_experiencia_operador || '',
                    financieras_robustez_razon_liquidez: selectedOperation.institucionesfinancieras?.financieras_robustez_razon_liquidez || '',
                    financieras_morosidad: selectedOperation.institucionesfinancieras?.financieras_morosidad || '',
                    financieras_solvencia: selectedOperation.institucionesfinancieras?.financieras_solvencia || '',
                    patrimoniales_rentabilidad_esperada: selectedOperation.inversionespatrimoniales?.patrimoniales_rentabilidad_esperada || '',
                    patrimoniales_tipo_fondo: selectedOperation.inversionespatrimoniales?.patrimoniales_tipo_fondo || '',
                    patrimoniales_antecedentes_gestor: selectedOperation.inversionespatrimoniales?.patrimoniales_antecedentes_gestor || '',
                    patrimoniales_experiencia_sector: selectedOperation.inversionespatrimoniales?.patrimoniales_experiencia_sector || '',
                    patrimoniales_experiencia_region: selectedOperation.inversionespatrimoniales?.patrimoniales_experiencia_region || '',
                    patrimoniales_experiencia_equipo: selectedOperation.inversionespatrimoniales?.patrimoniales_experiencia_equipo || '',
                    corpestfin_riesgo: selectedOperation.corporativoestructuradofinancieras?.corpestfin_riesgo || '',
                    corpestfin_spread_pb: selectedOperation.corporativoestructuradofinancieras?.corpestfin_spread_pb || '',
                    corpestfin_meses_gracia: selectedOperation.corporativoestructuradofinancieras?.corpestfin_meses_gracia || '',
                    corpestfin_comision_estructuracion: selectedOperation.corporativoestructuradofinancieras?.corpestfin_comision_estructuracion || '',
                    corpestfin_comision_anual: selectedOperation.corporativoestructuradofinancieras?.corpestfin_comision_anual || '',
                    corpestfin_robustez_cliente: selectedOperation.corporativoestructuradofinancieras?.corpestfin_robustez_cliente || '',
                    corpfin_robustez_gerencia: selectedOperation.corporativofinancieras?.corpfin_robustez_gerencia || '',
                    corpfin_robustez_posicion_mercado: selectedOperation.corporativofinancieras?.corpfin_robustez_posicion_mercado || ''
                });

                setShowAdditionalFields({
                    corporativo: selectedOperation.tipo_cliente === 'Corporativo',
                    estructurado: selectedOperation.tipo_cliente === 'Financiamiento Estructurado',
                    financieras: selectedOperation.tipo_cliente === 'Instituciones Financieras',
                    patrimoniales: selectedOperation.tipo_cliente === 'Inversiones Patrimoniales',
                    corporativo_estructurado_financieras: selectedOperation.tipo_cliente === 'Corporativo' || selectedOperation.tipo_cliente === 'Financiamiento Estructurado' || selectedOperation.tipo_cliente === 'Instituciones Financieras',
                    corporativo_financieras: selectedOperation.tipo_cliente === 'Corporativo' || selectedOperation.tipo_cliente === 'Instituciones Financieras'
                });

                const odsValues = [
                    selectedOperation.ods_1.toString(),
                    selectedOperation.ods_2.toString(),
                    selectedOperation.ods_3.toString(),
                    selectedOperation.ods_4.toString(),
                ].filter(Boolean); // Remove any empty or undefined values
                setSelectedOptions(odsValues);
            }
        } else {
            setOperation(getDefaultOperation());
            setSelectedOptions([]);
            setShowAdditionalFields({
                corporativo: false,
                estructurado: false,
                financieras: false,
                patrimoniales: false,
                corporativo_estructurado_financieras: false,
                corporativo_financieras: false
            });
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'sector_economico') {
            setSubSectors(subSectoresEconomicos[value] || []);
        }

        if (type === 'checkbox') {
            let updatedOptions = [...selectedOptions];
            if (checked) {
                updatedOptions.push(value);
            } else {
                updatedOptions = updatedOptions.filter(option => option !== value);
            }
            if (updatedOptions.length <= 4) {
                setSelectedOptions(updatedOptions);
                setOperation({
                    ...operation,
                    ods_1: updatedOptions[0] || '',
                    ods_2: updatedOptions[1] || '',
                    ods_3: updatedOptions[2] || '',
                    ods_4: updatedOptions[3] || ''
                });
            }
        } else {
            setOperation({ ...operation, [name]: value });
        }
        if (name === 'tipo_cliente') {
            const showFields = {
                corporativo: value === 'Corporativo',
                estructurado: value === 'Financiamiento Estructurado',
                financieras: value === 'Instituciones Financieras',
                patrimoniales: value === 'Inversiones Patrimoniales',
                corporativo_estructurado_financieras: value === 'Corporativo' || value === 'Financiamiento Estructurado' || value === 'Instituciones Financieras',
                corporativo_financieras: value === 'Corporativo' || value === 'Instituciones Financieras'
            };
            setShowAdditionalFields(showFields);
        }
    };

    const validateForm = () => {
        const tipoCliente = operation.tipo_cliente;
        const defaultFields = Object.keys(getDefaultOperation()).filter(field => field !== 'link_portal_negocio');

        let fieldsToCheck = [...defaultFields];

        // Add conditional fields based on tipo_cliente
        if (tipoCliente === 'Corporativo') {
            fieldsToCheck = defaultFields.filter(field => !field.startsWith('estructurado_') &&
                !field.startsWith('patrimoniales_') && !field.startsWith('financieras_') &&
                !field.startsWith('corpestfin_') && !field.startsWith('corpfin_')).concat([
                'corpestfin_riesgo',
                'corpestfin_spread_pb',
                'corpestfin_meses_gracia',
                'corpestfin_comision_estructuracion',
                'corpestfin_comision_anual',
                'corpestfin_robustez_cliente',
                'corpfin_robustez_gerencia',
                'corpfin_robustez_posicion_mercado',
                'corporativo_robustez_razon_liquidez',
                'corporativo_robustez_estructura_financiera',
                'corporativo_robustez_ffo'

            ]);
        } else if (tipoCliente === 'Financiamiento Estructurado') {
            fieldsToCheck = defaultFields.filter(field => !field.startsWith('corporativo_') &&
                !field.startsWith('patrimoniales_') && !field.startsWith('financieras_') &&
                !field.startsWith('corpestfin_') && !field.startsWith('corpfin_')).concat([
                'estructurado_contratacion_ingresos',
                'estructurado_capex_garantizado',
                'estructurado_financiamiento_identificado',
                'estructurado_permisos',
                'estructurado_estructura_ingresos',
                'estructurado_ingresos_publicos',
                'corpestfin_riesgo',
                'corpestfin_spread_pb',
                'corpestfin_meses_gracia',
                'corpestfin_comision_estructuracion',
                'corpestfin_comision_anual',
                'corpestfin_robustez_cliente',
                'estructurado_experiencia_epecista',
                'estructurado_experiencia_operador'
            ]);
        } else if (tipoCliente === 'Instituciones Financieras') {
            fieldsToCheck = defaultFields.filter(field => !field.startsWith('corporativo_') &&
                !field.startsWith('estructurado_') && !field.startsWith('patrimoniales_') &&
                !field.startsWith('corpestfin_') && !field.startsWith('corpfin_')).concat([
                'corpestfin_riesgo',
                'corpestfin_spread_pb',
                'corpestfin_meses_gracia',
                'corpestfin_comision_estructuracion',
                'corpestfin_comision_anual',
                'corpestfin_robustez_cliente',
                'corpfin_robustez_gerencia',
                'corpfin_robustez_posicion_mercado',
                'financieras_robustez_razon_liquidez',
                'financieras_morosidad',
                'financieras_solvencia',
            ]);
        } else if (tipoCliente === 'Inversiones Patrimoniales') {
            fieldsToCheck = defaultFields.filter(field => !field.startsWith('corporativo_') &&
                !field.startsWith('estructurado_') && !field.startsWith('financieras_') &&
                !field.startsWith('corpestfin_') && !field.startsWith('corpfin_')).concat([
                'patrimoniales_rentabilidad_esperada',
                'patrimoniales_tipo_fondo',
                'patrimoniales_antecedentes_gestor',
                'patrimoniales_experiencia_sector',
                'patrimoniales_experiencia_region',
                'patrimoniales_experiencia_equipo',
            ]);
        }

        fieldsToCheck = Array.from(new Set(fieldsToCheck));

        const missingFields = fieldsToCheck.filter(field => !operation[field]);

        if (missingFields.length > 0) {
            const missingFieldLabels = missingFields.map(field => fieldLabels[field]);
            setErrorMessage(
                <div className="error-message">
                    Por favor complete los siguientes campos obligatorios:
                    <ul>
                        {missingFieldLabels.map((label, index) => (
                            <li key={index}>
                                <a href={`#${missingFields[index]}`} onClick={(e) => {
                                    e.preventDefault();
                                    const element = document.getElementsByName(missingFields[index])[0];
                                    if (element) {
                                        const offset = -40; // Adjust this value to set how much higher you want to scroll
                                        const y = element.getBoundingClientRect().top + window.scrollY + offset;
                                        window.scrollTo({top: y, behavior: 'smooth'});
                                    }
                                }}>
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            );
            return false;
        }

        setErrorMessage('');
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            window.scrollTo(0, 0);
            return;
        }

        const requestData = { ...operation };
        const tipoCliente = requestData.tipo_cliente;
        let nestedRequestData = {};

        // Prepare nested data based on tipo_cliente
        if (tipoCliente === 'Corporativo') {
            nestedRequestData = {
                corporativo: {
                    corporativo_robustez_razon_liquidez: requestData.corporativo_robustez_razon_liquidez,
                    corporativo_robustez_estructura_financiera: requestData.corporativo_robustez_estructura_financiera,
                    corporativo_robustez_ffo: requestData.corporativo_robustez_ffo
                }
            };
        } else if (tipoCliente === 'Financiamiento Estructurado') {
            nestedRequestData = {
                financiamientoestructurado: {
                    estructurado_contratacion_ingresos: requestData.estructurado_contratacion_ingresos,
                    estructurado_capex_garantizado: requestData.estructurado_capex_garantizado,
                    estructurado_financiamiento_identificado: requestData.estructurado_financiamiento_identificado,
                    estructurado_permisos: requestData.estructurado_permisos,
                    estructurado_estructura_ingresos: requestData.estructurado_estructura_ingresos,
                    estructurado_ingresos_publicos: requestData.estructurado_ingresos_publicos,
                    estructurado_experiencia_epecista: requestData.estructurado_experiencia_epecista,
                    estructurado_experiencia_operador: requestData.estructurado_experiencia_operador
                }
            };
        } else if (tipoCliente === 'Instituciones Financieras') {
            nestedRequestData = {
                institucionesfinancieras: {
                    financieras_robustez_razon_liquidez: requestData.financieras_robustez_razon_liquidez,
                    financieras_morosidad: requestData.financieras_morosidad,
                    financieras_solvencia: requestData.financieras_solvencia
                }
            };
        } else if (tipoCliente === 'Inversiones Patrimoniales') {
            nestedRequestData = {
                inversionespatrimoniales: {
                    patrimoniales_rentabilidad_esperada: requestData.patrimoniales_rentabilidad_esperada,
                    patrimoniales_tipo_fondo: requestData.patrimoniales_tipo_fondo,
                    patrimoniales_antecedentes_gestor: requestData.patrimoniales_antecedentes_gestor,
                    patrimoniales_experiencia_sector: requestData.patrimoniales_experiencia_sector,
                    patrimoniales_experiencia_region: requestData.patrimoniales_experiencia_region,
                    patrimoniales_experiencia_equipo: requestData.patrimoniales_experiencia_equipo
                }
            };
        }

        if (['Corporativo', 'Financiamiento Estructurado', 'Instituciones Financieras'].includes(tipoCliente)) {
            nestedRequestData.corporativoestructuradofinancieras = {
                corpestfin_riesgo: requestData.corpestfin_riesgo,
                corpestfin_spread_pb: requestData.corpestfin_spread_pb,
                corpestfin_meses_gracia: requestData.corpestfin_meses_gracia,
                corpestfin_comision_estructuracion: requestData.corpestfin_comision_estructuracion,
                corpestfin_comision_anual: requestData.corpestfin_comision_anual,
                corpestfin_robustez_cliente: requestData.corpestfin_robustez_cliente
            };
        }

        // Handle shared variables between Corporativo and Instituciones Financieras
        if (['Corporativo', 'Instituciones Financieras'].includes(tipoCliente)) {
            nestedRequestData.corporativofinancieras = {
                corpfin_robustez_gerencia: requestData.corpfin_robustez_gerencia,
                corpfin_robustez_posicion_mercado: requestData.corpfin_robustez_posicion_mercado
            };
        }

        const finalData = { ...requestData, ...nestedRequestData };
        console.log('Final Data to be submitted:', finalData);

        if (selectedId) {
            // Update existing operation
            axiosInstance.put(`operations/${selectedId}/`, { ...requestData, ...nestedRequestData })
                .then(response => {
                    console.log('Operation updated:', response.data);
                    setMessage(`Operación con ID ${response.data.id} actualizada exitosamente.`);
                    window.scrollTo(0, 0);
                    setOperation(getDefaultOperation());
                    setSelectedId('');
                    setSelectedOptions([]);
                })
                .catch(error => console.error('Error updating operation:', error));
        } else {
            // Create new operation
            axiosInstance.post('operations/', { ...requestData, ...nestedRequestData })
                .then(response => {
                    console.log('Operation created:', response.data);
                    setMessage(`Operación creada exitosamente con ID ${response.data.id}. 
                Por favor, guarde este ID para futuras referencias y posibles modificaciones.`);
                    window.scrollTo(0, 0);
                    setOperation(getDefaultOperation());
                    setSelectedOptions([]);
                })
                .catch(error => console.error('Error creating operation:', error));
        }
    };

    return (
        <div className="operation-form-container">
            {message && <p className="message">{message}</p>}
            {errorMessage && <div>{errorMessage}</div>}
            <form className="operation-form" onSubmit={handleSubmit}>
                <div className="form-group center">
                    <label>ID:</label>
                    <select name="id" id="id-tooltip" onChange={handleSelectChange}>
                        <option value="">Seleccionar ID</option>
                        {operations.map(op => (
                            <option key={op.id} value={op.id}>{op.id}</option>
                        ))}
                    </select>
                    <Tooltip
                        anchorId="id-tooltip"
                        content="Seleccionar ID solo para operaciones que ya tienen un Score VSP. Si es la primera
                         vez ingresando esta operación en el sistema, no seleccione un ID. El ID correspondiente
                          será creado después del envío."
                        place="top"
                        effect="solid"
                        className="custom-tooltip"
                        variant="info"
                    />
                </div>
                <div className="h2 clearfix">Información Básica de la Operación</div>
                <div className="form-group">
                    <label>{fieldLabels.link_portal_negocio}</label>
                    <input type="url" name="link_portal_negocio" value={operation.link_portal_negocio}
                           onChange={handleChange}/>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.ejecutivo_negocio}:</label>
                    <input type="text" name="ejecutivo_negocio" value={operation.ejecutivo_negocio}
                           onChange={handleChange}/>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.nombre_cliente}:</label>
                    <input type="text" name="nombre_cliente" value={operation.nombre_cliente}
                           onChange={handleChange}/>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.nombre_operacion}:</label>
                    <input type="text" name="nombre_operacion" value={operation.nombre_operacion}
                           onChange={handleChange}/>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.pais}:</label>
                    <select name="pais" value={operation.pais}
                            onChange={handleChange}>
                        <option value="">Seleccionar País</option>
                        {paises.map((pais, index) => (
                            <option key={index} value={pais}>{pais}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.instrumento_financiero}:</label>
                    <select name="instrumento_financiero" value={operation.instrumento_financiero}
                            onChange={handleChange}>
                        <option value="">Seleccionar Instrumento</option>
                        {instrumentosFinancieros.map((instrumento, index) => (
                            <option key={index} value={instrumento}>{instrumento}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.tipo_cliente}:</label>
                    <select name="tipo_cliente" value={operation.tipo_cliente}
                            onChange={handleChange}>
                        <option value="">Seleccionar Cliente</option>
                        {clientes.map((cliente, index) => (
                            <option key={index} value={cliente}>{cliente}</option>
                        ))}
                    </select>
                </div>
                {showAdditionalFields.estructurado && (
                    <>
                        <div className="form-group">
                            <label>{fieldLabels.estructurado_contratacion_ingresos}:</label>
                            <select name="estructurado_contratacion_ingresos"
                                    value={operation.estructurado_contratacion_ingresos}
                                    onChange={handleChange}>
                                <option value="">Seleccionar Estado</option>
                                {contratacionIngresos.map((estado, index) => (
                                    <option key={index} value={estado}>{estado}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.estructurado_capex_garantizado}</label>
                            <select name="estructurado_capex_garantizado"
                                    value={operation.estructurado_capex_garantizado}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {binario.map((capex, index) => (
                                    <option key={index} value={capex}>{capex}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.estructurado_financiamiento_identificado}</label>
                            <select name="estructurado_financiamiento_identificado"
                                    value={operation.estructurado_financiamiento_identificado}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {binario.map((financiamiento, index) => (
                                    <option key={index} value={financiamiento}>{financiamiento}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.estructurado_permisos}:</label>
                            <select name="estructurado_permisos" value={operation.estructurado_permisos}
                                    onChange={handleChange}>
                                <option value="">Seleccionar Estado</option>
                                {permisos.map((permisos, index) => (
                                    <option key={index} value={permisos}>{permisos}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.estructurado_estructura_ingresos}:</label>
                            <select name="estructurado_estructura_ingresos"
                                    value={operation.estructurado_estructura_ingresos}
                                    onChange={handleChange}>
                                <option value="">Seleccionar Estructura</option>
                                {estructuraIngresos.map((estructura, index) => (
                                    <option key={index} value={estructura}>{estructura}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.estructurado_ingresos_publicos}:</label>
                            <select name="estructurado_ingresos_publicos"
                                    value={operation.estructurado_ingresos_publicos}
                                    onChange={handleChange}>
                                <option value="">Seleccionar Porcentaje</option>
                                {porcentajeIngresosPublicos.map((porcentaje, index) => (
                                    <option key={index} value={porcentaje}>{porcentaje}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
                <div className="form-group">
                    <label>{fieldLabels.monto_miles}:</label>
                    <input type="number" name="monto_miles" value={operation.monto_miles}
                           onChange={handleChange}/>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.moneda_local}</label>
                    <select name="moneda_local" value={operation.moneda_local}
                            onChange={handleChange}>
                        <option value="">Seleccionar</option>
                        {binario.map((moneda, index) => (
                            <option key={index} value={moneda}>{moneda}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.calificacion_externa_cliente}:</label>
                    <select name="calificacion_externa_cliente" value={operation.calificacion_externa_cliente}
                            onChange={handleChange}>
                        <option value="">Seleccionar Calificación</option>
                        {calificacionExterna.map((calificacion, index) => (
                            <option key={index} value={calificacion}>{calificacion}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.rating_cliente}:</label>
                    <select name="rating_cliente" value={operation.rating_cliente}
                            onChange={handleChange}>
                        <option value="">Seleccionar Rating</option>
                        {ratingCliente.map((rating, index) => (
                            <option key={index} value={rating}>{rating}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.calificacion_interna_cliente}:</label>
                    <select name="calificacion_interna_cliente" value={operation.calificacion_interna_cliente}
                            onChange={handleChange}>
                        <option value="">Seleccionar Calificación</option>
                        {calificacionInterna.map((calificacion, index) => (
                            <option key={index} value={calificacion}>{calificacion}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.necesidad_cliente}:</label>
                    <select name="necesidad_cliente" value={operation.necesidad_cliente}
                            onChange={handleChange}>
                        <option value="">Seleccionar</option>
                        {necesidadCliente.map((necesidad, index) => (
                            <option key={index} value={necesidad}>{necesidad}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.competitividad_caf}</label>
                    <select name="competitividad_caf" value={operation.competitividad_caf}
                            onChange={handleChange}>
                        <option value="">Seleccionar</option>
                        {madurez.map((competitivo, index) => (
                            <option key={index} value={competitivo}>{competitivo}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.experiencia_caf}</label>
                    <select name="experiencia_caf" value={operation.experiencia_caf}
                            onChange={handleChange}>
                        <option value="">Seleccionar</option>
                        {madurez.map((experiencia, index) => (
                            <option key={index} value={experiencia}>{experiencia}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group full-width">
                    <label>{fieldLabels.descripcion}:</label>
                    <textarea name="descripcion" value={operation.descripcion} onChange={handleChange}></textarea>
                </div>
                <div className="h2 clearfix">Adicionalidad e Impacto al Desarrollo</div>
                <div className="form-group">
                    <label>{fieldLabels.actividad_principal}:</label>
                    <select name="actividad_principal" value={operation.actividad_principal} onChange={handleChange}>
                        <option value="">Seleccionar Actividad</option>
                        {actividadesPrincipales.map((actividad, index) => (
                            <option key={index} value={actividad}>{actividad}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.segmento_operacion}:</label>
                    <select name="segmento_operacion" value={operation.segmento_operacion} onChange={handleChange}>
                        <option value="">Seleccionar Segmento</option>
                        {segmentos.map((segmento, index) => (
                            <option key={index} value={segmento}>{segmento}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.sector_economico}:</label>
                    <select name="sector_economico" value={operation.sector_economico} onChange={handleChange}>
                        <option value="">Seleccionar Sector</option>
                        {sectoresEconomicos.map((sector, index) => (
                            <option key={index} value={sector}>{sector}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.sub_sector_economico}:</label>
                    <select name="sub_sector_economico" value={operation.sub_sector_economico} onChange={handleChange}>
                        <option value="">Seleccionar Sector</option>
                        {subSectors.map((subsector, index) => (
                            <option key={index} value={subsector}>{subsector}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.area_actuacion}:</label>
                    <select name="area_actuacion" value={operation.area_actuacion} onChange={handleChange}>
                        <option value="">Seleccionar Área</option>
                        {areasActuacion.map((actuacion, index) => (
                            <option key={index} value={actuacion}>{actuacion}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.agendas_misionales}:</label>
                    <select name="agendas_misionales" value={operation.agendas_misionales} onChange={handleChange}>
                        <option value="">Seleccionar Agenda</option>
                        {agendasMisionales.map((agenda, index) => (
                            <option key={index} value={agenda}>{agenda}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.agendas_transversales_verdes}</label>
                    <select name="agendas_transversales_verdes" value={operation.agendas_transversales_verdes}
                            onChange={handleChange}>
                        <option value="">Seleccionar</option>
                        {binario.map((verde, index) => (
                            <option key={index} value={verde}>{verde}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.agendas_transversales_b4}</label>
                    <select name="agendas_transversales_b4" value={operation.agendas_transversales_b4}
                            onChange={handleChange}>
                        <option value="">Seleccionar Abordaje</option>
                        {agendasTransversalesB4.map((genero, index) => (
                            <option key={index} value={genero}>{genero}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.agendas_transversales_b5}</label>
                    <select name="agendas_transversales_b5" value={operation.agendas_transversales_b5}
                            onChange={handleChange}>
                        <option value="">Seleccionar Integración</option>
                        {agendasTransversalesB5.map((integracion, index) => (
                            <option key={index} value={integracion}>{integracion}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.agendas_transversales_b6}</label>
                    <select name="agendas_transversales_b6" value={operation.agendas_transversales_b6}
                            onChange={handleChange}>
                        <option value="">Seleccionar Movilización</option>
                        {agendasTransversalesB6.map((movilizacion, index) => (
                            <option key={index} value={movilizacion}>{movilizacion}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group full-width">
                    <label>Selecciona cuatro contribuciones a los Objetivos de Desarrollo Sostenible (ODS) que la
                        operación ofrece:</label>
                    <div className="checkbox-group">
                        {objetivosDesarrolloSostenible.map((ods, index) => (
                            <label key={index} htmlFor={`ods-${index}`}>
                                <input
                                    type="checkbox"
                                    id={`ods-${index}`}
                                    name={`ods_${index + 1}`}
                                    value={ods.value}
                                    onChange={handleChange}
                                    checked={selectedOptions.includes(ods.value)}
                                />
                                {ods.text}
                                <Tooltip
                                    anchorId={`ods-${index}`}
                                    content={ods.definition}
                                    place="top"
                                    effect="solid"
                                    variant="info"
                                />
                            </label>
                        ))}
                    </div>
                </div>
                <div className="form-group full-width">
                    <label>Argumento de Adicionalidad:</label>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.adicionalidad_cubrir_brechas}</label>
                    <select name="adicionalidad_cubrir_brechas" value={operation.adicionalidad_cubrir_brechas}
                            onChange={handleChange}>
                        <option value="">Seleccionar</option>
                        {binario.map((brecha, index) => (
                            <option key={index} value={brecha}>{brecha}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.adicionalidad_mitigar_riesgos}</label>
                    <select name="adicionalidad_mitigar_riesgos" value={operation.adicionalidad_mitigar_riesgos}
                            onChange={handleChange}>
                        <option value="">Seleccionar</option>
                        {binario.map((mitigacion, index) => (
                            <option key={index} value={mitigacion}>{mitigacion}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.adicionalidad_mejorar_condiciones}</label>
                    <select name="adicionalidad_mejorar_condiciones"
                            value={operation.adicionalidad_mejorar_condiciones}
                            onChange={handleChange}>
                        <option value="">Seleccionar</option>
                        {binario.map((condiciones, index) => (
                            <option key={index} value={condiciones}>{condiciones}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.adicionalidad_movilizar_recursos}</label>
                    <select name="adicionalidad_movilizar_recursos"
                            value={operation.adicionalidad_movilizar_recursos}
                            onChange={handleChange}>
                        <option value="">Seleccionar</option>
                        {binario.map((fuentes, index) => (
                            <option key={index} value={fuentes}>{fuentes}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.adicionalidad_instrumento_innovador}</label>
                    <select name="adicionalidad_instrumento_innovador"
                            value={operation.adicionalidad_instrumento_innovador}
                            onChange={handleChange}>
                        <option value="">Seleccionar</option>
                        {binario.map((innovacion, index) => (
                            <option key={index} value={innovacion}>{innovacion}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.adicionalidad_conocimiento}</label>
                    <select name="adicionalidad_conocimiento" value={operation.adicionalidad_conocimiento}
                            onChange={handleChange}>
                        <option value="">Seleccionar</option>
                        {binario.map((conocimiento, index) => (
                            <option key={index} value={conocimiento}>{conocimiento}</option>
                        ))}
                    </select>
                </div>
                <div className="h2 clearfix">Rentabilidad de la operación</div>
                <div className="form-group">
                    <label>{fieldLabels.fecha_tentativa_desembolso}:</label>
                    <input type="date" name="fecha_tentativa_desembolso"
                           value={operation.fecha_tentativa_desembolso}
                           onChange={handleChange}/>
                </div>
                <div className="form-group">
                    <label>{fieldLabels.plazo_operacion}:</label>
                    <input type="number" name="plazo_operacion" value={operation.plazo_operacion}
                           onChange={handleChange}/>
                </div>
                {showAdditionalFields.corporativo_estructurado_financieras && (
                    <>
                        <div className="form-group">
                            <label>{fieldLabels.corpestfin_riesgo}:</label>
                            <select name="corpestfin_riesgo" value={operation.corpestfin_riesgo}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {riesgoOperacion.map((riesgo, index) => (
                                    <option key={index} value={riesgo}>{riesgo}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.corpestfin_spread_pb}:</label>
                            <input type="number" name="corpestfin_spread_pb" value={operation.corpestfin_spread_pb}
                                   onChange={handleChange}/>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.corpestfin_meses_gracia}:</label>
                            <input type="number" name="corpestfin_meses_gracia" value={operation.corpestfin_meses_gracia}
                                   onChange={handleChange}/>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.corpestfin_comision_estructuracion}:</label>
                            <input type="number" name="corpestfin_comision_estructuracion" value={operation.corpestfin_comision_estructuracion}
                                   onChange={handleChange}/>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.corpestfin_comision_anual}:</label>
                            <input type="number" name="corpestfin_comision_anual" value={operation.corpestfin_comision_anual}
                                   onChange={handleChange}/>
                        </div>
                    </>
                )}
                {showAdditionalFields.patrimoniales && (
                    <>
                        <div className="form-group">
                            <label>{fieldLabels.patrimoniales_rentabilidad_esperada}:</label>
                            <input type="number" name="patrimoniales_rentabilidad_esperada"
                                   value={operation.patrimoniales_rentabilidad_esperada}
                                   onChange={handleChange}/>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.patrimoniales_tipo_fondo}:</label>
                            <select name="patrimoniales_tipo_fondo"
                                    value={operation.patrimoniales_tipo_fondo}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {tipoFondo.map((fondo, index) => (
                                    <option key={index} value={fondo}>{fondo}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
                {showAdditionalFields.corporativo_estructurado_financieras && (
                    <>
                        <div className="h2 clearfix">Robustez del Cliente</div>
                        <div className="form-group">
                            <label>{fieldLabels.corpestfin_robustez_cliente}:</label>
                            <select name="corpestfin_robustez_cliente" value={operation.corpestfin_robustez_cliente}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {robustezCliente.map((robustez, index) => (
                                    <option key={index} value={robustez}>{robustez}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
                {showAdditionalFields.corporativo_financieras && (
                    <>
                        <div className="form-group">
                            <label>{fieldLabels.corpfin_robustez_gerencia}:</label>
                            <select name="corpfin_robustez_gerencia" value={operation.corpfin_robustez_gerencia}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {gerencia.map((calidad, index) => (
                                    <option key={index} value={calidad}>{calidad}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.corpfin_robustez_posicion_mercado}:</label>
                            <select name="corpfin_robustez_posicion_mercado" value={operation.corpfin_robustez_posicion_mercado}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {posicionMercado.map((competitividad, index) => (
                                    <option key={index} value={competitividad}>{competitividad}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
                {showAdditionalFields.corporativo && (
                    <>
                        <div className="form-group">
                            <label>{fieldLabels.corporativo_robustez_razon_liquidez}:</label>
                            <select name="corporativo_robustez_razon_liquidez"
                                    value={operation.corporativo_robustez_razon_liquidez}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {razonLiquidezCorporativo.map((liquidez, index) => (
                                    <option key={index} value={liquidez}>{liquidez}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.corporativo_robustez_estructura_financiera}:</label>
                            <select name="corporativo_robustez_estructura_financiera"
                                    value={operation.corporativo_robustez_estructura_financiera}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {estructuraFinanciera.map((estructura, index) => (
                                    <option key={index} value={estructura}>{estructura}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.corporativo_robustez_ffo}:</label>
                            <select name="corporativo_robustez_ffo" value={operation.corporativo_robustez_ffo}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {coberturaFlujoCaja.map((ffo, index) => (
                                    <option key={index} value={ffo}>{ffo}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
                {showAdditionalFields.estructurado && (
                    <>
                        <div className="form-group">
                            <label>{fieldLabels.estructurado_experiencia_epecista}:</label>
                            <select name="estructurado_experiencia_epecista"
                                    value={operation.estructurado_experiencia_epecista}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {madurez.map((madurez, index) => (
                                    <option key={index} value={madurez}>{madurez}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.estructurado_experiencia_operador}:</label>
                            <select name="estructurado_experiencia_operador"
                                    value={operation.estructurado_experiencia_operador}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {madurez.map((madurez, index) => (
                                    <option key={index} value={madurez}>{madurez}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
                {showAdditionalFields.financieras && (
                    <>
                        <div className="form-group">
                            <label>{fieldLabels.financieras_robustez_razon_liquidez}:</label>
                            <select name="financieras_robustez_razon_liquidez"
                                    value={operation.financieras_robustez_razon_liquidez}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {razonLiquidezFinancieras.map((liquidez, index) => (
                                    <option key={index} value={liquidez}>{liquidez}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.financieras_morosidad}:</label>
                            <select name="financieras_morosidad"
                                    value={operation.financieras_morosidad}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {nivel.map((morosidad, index) => (
                                    <option key={index} value={morosidad}>{morosidad}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.financieras_solvencia}:</label>
                            <select name="financieras_solvencia"
                                    value={operation.financieras_solvencia}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {nivel.map((solvencia, index) => (
                                    <option key={index} value={solvencia}>{solvencia}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
                {showAdditionalFields.patrimoniales && (
                    <>
                        <div className="h2 clearfix">Robustez del Cliente</div>
                        <div className="form-group">
                            <label>{fieldLabels.patrimoniales_antecedentes_gestor}:</label>
                            <select name="patrimoniales_antecedentes_gestor"
                                    value={operation.patrimoniales_antecedentes_gestor}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {antecedentesGestor.map((antecedentes, index) => (
                                    <option key={index} value={antecedentes}>{antecedentes}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.patrimoniales_experiencia_sector}:</label>
                            <select name="patrimoniales_experiencia_sector"
                                    value={operation.patrimoniales_experiencia_sector}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {experiencia.map((experiencia, index) => (
                                    <option key={index} value={experiencia}>{experiencia}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.patrimoniales_experiencia_region}:</label>
                            <select name="patrimoniales_experiencia_region"
                                    value={operation.patrimoniales_experiencia_region}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {experiencia.map((experiencia, index) => (
                                    <option key={index} value={experiencia}>{experiencia}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{fieldLabels.patrimoniales_experiencia_equipo}:</label>
                            <select name="patrimoniales_experiencia_equipo"
                                    value={operation.patrimoniales_experiencia_equipo}
                                    onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                {experiencia.map((experiencia, index) => (
                                    <option key={index} value={experiencia}>{experiencia}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
                <div className="form-group full-width">
                    <button type="submit">Enviar</button>
                </div>
            </form>
        </div>
    );
};

export default OperationForm;