import os
from django.conf import settings
import json
import pandas as pd
import numpy as np
import numpy_financial as npf
from typing import Any, Dict, Optional, Tuple
from fractions import Fraction
from django.core import signing
import requests
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

SUPERSET_ADMIN_USERNAME = str(settings.SUPERSET_ADMIN_USERNAME)
SUPERSET_ADMIN_PASSWORD = str(settings.SUPERSET_ADMIN_PASSWORD)
SUPERSET_URL = str(settings.SUPERSET_URL)
FRED_API_KEY = settings.FRED_API_KEY

# Constants
ADICIONALIDAD_IMPACTO = 'adicionalidad_impacto'
PESOS_ADICIONALIDAD_IMPACTO = 'pesos_adicionalidad_impacto'

PREMIDES = 'premides'
PESOS_PREMIDES = 'pesos_premides'
ALINEACION_ESTRATEGIA_VSP = 'alineacion_estrategia_vsp'
POTENCIAL_IMPACTO = 'potencial_impacto'
APORTES_AL_DESARROLLO = 'aportes_al_desarrollo'
ALINEACION_ESTRATEGIA_PAIS = 'alineacion_estrategia_pais'
INDICE_ESTADO_DE_DERECHO = 'indice_estado_de_derecho'
BRECHA_DESEMPLEO = 'brecha_desempleo'
OPINION_EQUIPO = 'opinion_equipo'

AREA_ACTUACION = 'area_actuacion'
ACTIVIDAD_PRINCIPAL = 'actividad_principal'
PAIS = 'pais'
ODS_1 = 'ods_1'
ODS_2 = 'ods_2'
ODS_3 = 'ods_3'
ODS_4 = 'ods_4'
SECTOR_ECONOMICO = 'sector_economico'
SUB_SECTOR_ECONOMICO = 'sub_sector_economico'
INSTRUMENTO_FINANCIERO = 'instrumento_financiero'

AGENDAS_TRANSVERSALES = 'agendas_transversales'
PESOS_AGENDAS_TRANSVERSALES = 'pesos_agendas_transversales'
AGENDAS_TRANSVERSALES_VERDES = 'agendas_transversales_verdes'
AGENDAS_TRANSVERSALES_B4 = 'agendas_transversales_b4'
AGENDAS_TRANSVERSALES_B5 = 'agendas_transversales_b5'
AGENDAS_TRANSVERSALES_B6 = 'agendas_transversales_b6'

ADICIONALIDAD = 'adicionalidad'
PESOS_ADICIONALIDAD = 'pesos_adicionalidad'
ADICIONALIDAD_CUBRIR_BRECHAS = 'adicionalidad_cubrir_brechas'
ADICIONALIDAD_MITIGAR_RIESGOS = 'adicionalidad_mitigar_riesgos'
ADICIONALIDAD_MEJORAR_CONDICIONES = 'adicionalidad_mejorar_condiciones'
ADICIONALIDAD_MOVILIZAR_RECURSOS = 'adicionalidad_movilizar_recursos'
ADICIONALIDAD_INSTRUMENTO_INNOVADOR = 'adicionalidad_instrumento_innovador'
ADICIONALIDAD_CONOCIMIENTO = 'adicionalidad_conocimiento'
BASE_ADICIONALIDAD = 'base_adicionalidad'

SEGMENTO_OPERACION = 'segmento_operacion'

RAROC = 'raroc'
CAPITAL = 'capital'
METODOLOGIA_CAPITAL_SP = 'sp'
METODOLOGIA_CAPITAL_BASILEA = 'basilea'
METODOLOGIA_CAPITAL_PERDIDA_NO_ESPERADA = 'perdida_no_esperada'

SEGMENTO_RWA = 'segmento_rwa'
RWA = 'rwa'
TIPO_RWA = 'tipo_rwa'
PUNTUACION = 'puntuacion'
RATING = "rating"
RIESGO_OPERACION = 'corpestfin_riesgo'
RIESGO_SOBERANO = 'Soberano'
PAIS_CATEGORIA_3 = 'Venezuela'
RWA_SOBERANO = 'rwa_soberano'
RIESGO_SOBERANO_CATEGORIA_1 = "rwa_cat_1"
RIESGO_SOBERANO_CATEGORIA_3 = "rwa_cat_3"

CALIFICACION_EXTERNA_CLIENTE = 'calificacion_externa_cliente'
NO_CALIFICACION_EXTERNA = 'No Tiene'
RATING_EXTERNO = 'rating_cliente'
CALIFICACION_INTERNA_CLIENTE = 'calificacion_interna_cliente'
BASILEA_RATING_EXTERNO = 'basilea_rating_externo'
BASILEA_RATING_INTERNO = 'basilea_rating_interno'

REQUERIMIENTOS_PERDIDA_NO_ESPERADA = 'requerimientos_perdidas_no_esperada'

SUPUESTOS_CAPITAL = 'supuestos_capital'
BASE_PONDERADOR_APR_SP = 100
REQUERIMIENTOS_CAPITAL = 'requerimientos_capital'

EXPOSICION = 'monto_miles'

CONVERSION_SOFR_PORCENTAJE = 100

PLAZO = 'plazo_operacion'
REPAGOS_ANUALES = 2
SPREAD_ANUAL_PRESTAMO = 'corpestfin_spread_pb'
RETORNO_ANUAL_INVERSION = 'patrimoniales_rentabilidad_esperada'
CONVERSION_PBS_PORCENTAJE = 10000
COMISION_ESTRUCTURACION = 'corpestfin_comision_estructuracion'
PERIODO_GRACIA = 'corpestfin_meses_gracia'

COSTO_FONDEO = 'costo_fondeo'
COSTO_FONDEO_MIN_YEAR = '1'
COSTO_FONDEO_MAX_YEAR = '10'

PERDIDA_ESPERADA = 'perdida_esperada'
PD_PERDIDA_ESPERADA = 'pd_perdida_esperada'
PREVISIONES = 'previsiones'
PD_TECHO_PAIS = 'pd_techo_pais'
PD_CLIENTE = 'pd_cliente'
LGD = 'lgd'
COSTO_OPERATIVO = 'costo_operativo'
COSTO = 'costo'

BANDA_SUPERIOR_RAROC =  0.04
BANDA_INTERMEDIA_RAROC = 0.02
BANDA_INFERIOR_RAROC = 0

TIPO_CLIENTE = 'tipo_cliente'

MADUREZ_PROYECTO = 'madurez_proyecto'
PESOS_MADUREZ = 'pesos_madurez'

ROBUSTEZ_CLIENTE = 'robustez_cliente'
PESOS_ROBUSTEZ = 'pesos_robustez'

PESOS_SCORE = 'pesos_score'


def generate_verification_token(user):
    return signing.dumps({'user_id': user.pk})

def get_client_ip(request):
    x_forwarded_for = request.headers.get('X-Forwarded-For')
    if x_forwarded_for:
        # X-Forwarded-For can contain multiple IPs, take the first one
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def ratelimit_key(group, request):
    return get_client_ip(request)

def generate_superset_guest_token(dashboard_id):

    logger.info(f"Generating guest token for dashboard ID: {dashboard_id}")

    # Get Superset access token
    superset_url = SUPERSET_URL
    login_endpoint = '/api/v1/security/login'

    login_payload = {
        "username": SUPERSET_ADMIN_USERNAME,
        "password": SUPERSET_ADMIN_PASSWORD,
        "provider": "db",
        "refresh": True,
    }

    login_response = requests.post(
        superset_url + login_endpoint,
        json=login_payload,
    )
    login_data = login_response.json()
    access_token = login_data['access_token']

    # Generate guest token
    guest_token_endpoint = '/api/v1/security/guest_token/'
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
    }

    guest_token_payload = {
        "user": {
            "username": "fulano",
        },
        "resources": [
            {
                "type": "dashboard",
                "id": dashboard_id,
            }
        ],
        "rls": [],
    }

    response = requests.post(
        superset_url + guest_token_endpoint,
        json=guest_token_payload,
        headers=headers,
    )

    if response.status_code == 200:
        data = response.json()
        guest_token = data['token']
        return guest_token
    else:
        raise Exception(f"Error generating guest token: {response.text}")


# Load configuration from JSON file
CONFIG_PATH = os.path.join(os.path.dirname(__file__), '.', 'config.json')

def load_config(config_path: str) -> Dict[str, Any]:
    """
    Load configuration from a JSON file.

    Parameters:
        config_path (str): Path to the configuration file.

    Returns:
        Dict[str, Any]: Configuration data.
    """
    try:
        with open(config_path, 'r') as config_file:
            return json.load(config_file)
    except FileNotFoundError:
        raise FileNotFoundError(f"Configuration file not found at {config_path}")
    except json.JSONDecodeError:
        raise ValueError(f"Error decoding JSON from the configuration file at {config_path}")

CONFIG = load_config(CONFIG_PATH)


def get_nested_value(dictionary: Dict[str, Any], *keys: str) -> Any:
    """
    Safely get a nested value from a dictionary.

    Parameters:
        dictionary (Dict[str, Any]): The dictionary to get the value from.
        keys (str): The keys to navigate through the dictionary.

    Returns:
        Any: The value from the dictionary, or 0 if any key is not found.
    """
    for key in keys:
        if isinstance(dictionary, dict) and key in dictionary:
            dictionary = dictionary[key]
        else:
            return 0
    return dictionary


def calculate_weighted_value(segment: str, component: str, pesos: str, data_key: str, operation_data: Dict[str, Any],
                             additional_keys: Optional[Tuple[str, ...]] = None) -> float:
    """
    Calculate a weighted value for a given component using operation data.

    Parameters:
        segment (str): The segment of the score.
        component (str): The component to calculate.
        pesos (str): The weights to use for calculation.
        data_key (str): The data key to use for calculation.
        operation_data (Dict[str, Any]): The operation data.
        additional_keys (Optional[Tuple[str, ...]]): Additional keys for nested dictionary lookup.

    Returns:
        float: The calculated weighted value.
    """
    additional_keys = additional_keys or ()
    weight = get_nested_value(CONFIG[segment][component], pesos, data_key)
    value = get_nested_value(CONFIG[segment][component], data_key, *additional_keys)

    weighted_value = float(Fraction(weight)) * value

    return weighted_value


def calculate_premides(operation_data: Dict[str, Any]) -> float:
    """
    Calculate the premides value based on operation data.

    Parameters:
        operation_data (Dict[str, Any]): The operation data.

    Returns:
        float: The calculated premides value.
    """
    value_alineacion_vsp = calculate_weighted_value(ADICIONALIDAD_IMPACTO,
                                                    PREMIDES,
                                                    PESOS_PREMIDES,
                                                    ALINEACION_ESTRATEGIA_VSP,
                                                    operation_data,
                                                    (operation_data.get(AREA_ACTUACION, ''),))

    value_impacto = calculate_weighted_value(ADICIONALIDAD_IMPACTO,
                                             PREMIDES,
                                             PESOS_PREMIDES,
                                             POTENCIAL_IMPACTO,
                                             operation_data,
                                             (operation_data.get(ACTIVIDAD_PRINCIPAL, ''),))

    value_aportes_list = [calculate_weighted_value(ADICIONALIDAD_IMPACTO,
                                                   PREMIDES,
                                                   PESOS_PREMIDES,
                                                   APORTES_AL_DESARROLLO,
                                                   operation_data,
                                                   (operation_data.get(PAIS, ''),
                                                    operation_data.get(ods_value, '')))
                          for ods_value in [ODS_1, ODS_2, ODS_3, ODS_4]]

    value_aportes = np.mean(value_aportes_list)

    value_alineacion_pais = calculate_weighted_value(ADICIONALIDAD_IMPACTO,
                                                     PREMIDES,
                                                     PESOS_PREMIDES,
                                                     ALINEACION_ESTRATEGIA_PAIS,
                                                     operation_data,
                                                     (operation_data.get(PAIS, ''),
                                                      operation_data.get(SECTOR_ECONOMICO, ''),
                                                      operation_data.get(SUB_SECTOR_ECONOMICO, '')))

    value_estado_derecho = calculate_weighted_value(ADICIONALIDAD_IMPACTO,
                                                    PREMIDES,
                                                    PESOS_PREMIDES,
                                                    INDICE_ESTADO_DE_DERECHO,
                                                    operation_data,
                                                    (operation_data.get(PAIS, ''),))

    value_brecha = calculate_weighted_value(ADICIONALIDAD_IMPACTO,
                                            PREMIDES,
                                            PESOS_PREMIDES,
                                            BRECHA_DESEMPLEO,
                                            operation_data,
                                            (operation_data.get(PAIS, ''),))

    value_opinion = calculate_weighted_value(ADICIONALIDAD_IMPACTO,
                                             PREMIDES,
                                             PESOS_PREMIDES,
                                             OPINION_EQUIPO,
                                             operation_data,
                                             (operation_data.get(PAIS, ''),
                                              operation_data.get(INSTRUMENTO_FINANCIERO, ''),
                                              operation_data.get(SECTOR_ECONOMICO, ''),
                                              operation_data.get(SUB_SECTOR_ECONOMICO, '')))

    premides_value = (value_alineacion_vsp + value_impacto + value_aportes + value_alineacion_pais +
                      value_estado_derecho + value_brecha + value_opinion)

    return premides_value


def calculate_agendas_transversales(operation_data: Dict[str, Any]) -> float:
    """
    Calculate the agendas_transversales value based on operation data.

    Parameters:
        operation_data (Dict[str, Any]): The operation data.

    Returns:
        float: The calculated agendas_transversales value.
    """
    values = []
    for key in [AGENDAS_TRANSVERSALES_VERDES, AGENDAS_TRANSVERSALES_B4, AGENDAS_TRANSVERSALES_B5,
                AGENDAS_TRANSVERSALES_B6]:
        value = calculate_weighted_value(ADICIONALIDAD_IMPACTO,
                                         AGENDAS_TRANSVERSALES,
                                         PESOS_AGENDAS_TRANSVERSALES,
                                         key,
                                         operation_data,
                                         (operation_data.get(key, ''),))
        values.append(value)

    agendas_transversales_value = sum(values)

    return agendas_transversales_value


def calculate_adicionalidad(operation_data: Dict[str, Any]) -> float:
    """
    Calculate the adicionalidad value based on operation data.

    Parameters:
        operation_data (Dict[str, Any]): The operation data.

    Returns:
        float: The calculated adicionalidad value.
    """
    values = []
    for key in [ADICIONALIDAD_CUBRIR_BRECHAS, ADICIONALIDAD_MITIGAR_RIESGOS, ADICIONALIDAD_MEJORAR_CONDICIONES,
                ADICIONALIDAD_MOVILIZAR_RECURSOS, ADICIONALIDAD_INSTRUMENTO_INNOVADOR, ADICIONALIDAD_CONOCIMIENTO]:
        value = calculate_weighted_value(ADICIONALIDAD_IMPACTO,
                                         ADICIONALIDAD,
                                         PESOS_ADICIONALIDAD,
                                         key,
                                         operation_data,
                                         (operation_data.get(key, ''),))
        values.append(value)

    adicionalidad_value = sum(values)

    if adicionalidad_value != 0:
        adicionalidad_value += CONFIG[ADICIONALIDAD_IMPACTO][ADICIONALIDAD][BASE_ADICIONALIDAD]

    return adicionalidad_value


def calculate_segmento_operacion(operation_data: Dict[str, Any]) -> float:
    """
    Calculate the segmento value based on operation data.

    Parameters:
        operation_data (Dict[str, Any]): The operation data.

    Returns:
        float: The calculated segmento value.
    """
    segmento_operacion = operation_data.get(SEGMENTO_OPERACION, '')
    segmento_component = CONFIG[ADICIONALIDAD_IMPACTO][SEGMENTO_OPERACION]
    segmento_value = get_nested_value(segmento_component, segmento_operacion)

    return segmento_value

def calculate_adicionalidad_impacto(operation_data: Dict[str, Any]) -> float:
    """
    Calculate the adicionalidad_impacto value based on operation data.

    Parameters:
        operation_data (Dict[str, Any]): The operation data.

    Returns:
        float: The calculated adicionalidad_impacto value.
    """
    premides = calculate_premides(operation_data)
    agendas = calculate_agendas_transversales(operation_data)
    adicionalidad = calculate_adicionalidad(operation_data)
    segmento_operacion = calculate_segmento_operacion(operation_data)

    values = [premides, agendas, adicionalidad, segmento_operacion]

    pesos = list(CONFIG[ADICIONALIDAD_IMPACTO][PESOS_ADICIONALIDAD_IMPACTO].values())

    adicionalidad_impacto_value = sum([v * float(Fraction(p)) for v, p in zip(values, pesos)])

    return adicionalidad_impacto_value

def calculate_capital_sp(operation_data: Dict[str, Any]) -> float:
    """
    Calculate the ponderador based on Standrad & Poors and operation data.

    Parameters:
        operation_data (Dict[str, Any]): The operation data.

    Returns:
        float: The calculated value for ponderador.
    """
    segmento_operacion = operation_data.get(SEGMENTO_OPERACION, '')
    pais = operation_data.get(PAIS, '')
    riesgo_operacion = operation_data.get(RIESGO_OPERACION, '')

    sp = CONFIG[RAROC][CAPITAL][METODOLOGIA_CAPITAL_SP]

    if riesgo_operacion == RIESGO_SOBERANO:
        tipo_rwa = RWA_SOBERANO
        puntuacion = RATING
    else:
        tipo_rwa = sp[SEGMENTO_RWA][segmento_operacion][TIPO_RWA]
        puntuacion = sp[SEGMENTO_RWA][segmento_operacion][PUNTUACION]

    value = str(sp[RWA][pais][puntuacion])

    if tipo_rwa==RWA_SOBERANO and pais == PAIS_CATEGORIA_3:
        ponderador = sp[TIPO_RWA][tipo_rwa][value][RIESGO_SOBERANO_CATEGORIA_3]
    elif tipo_rwa==RWA_SOBERANO:
        ponderador = sp[TIPO_RWA][tipo_rwa][value][RIESGO_SOBERANO_CATEGORIA_1]
    else:
        ponderador = sp[TIPO_RWA][tipo_rwa][value]

    return ponderador


def calculate_capital_basilea(operation_data: Dict[str, Any]) -> float:
    """
    Calculate the ponderador based on Basilea and operation data.

    Parameters:
        operation_data (Dict[str, Any]): The operation data.

    Returns:
        float: The calculated values for ponderador.
    """
    segmento_operacion = operation_data.get(SEGMENTO_OPERACION, '')
    calificacion_externa = operation_data.get(CALIFICACION_EXTERNA_CLIENTE, '')
    rating_externo = operation_data.get(RATING_EXTERNO, '')
    calificacion_interna = operation_data.get(CALIFICACION_INTERNA_CLIENTE, '')
    basilea = CONFIG[RAROC][CAPITAL][METODOLOGIA_CAPITAL_BASILEA]

    if calificacion_externa == NO_CALIFICACION_EXTERNA:
        ponderador = basilea[BASILEA_RATING_INTERNO][segmento_operacion][calificacion_interna]
    else:
        ponderador = basilea[BASILEA_RATING_EXTERNO][segmento_operacion][rating_externo]

    return ponderador


def calculate_capital_perdidas_no_esperadas() -> float:
    """
    Calculate the Pérdidas no Esperadas.

    Returns:
        float: The calculated value for Pérdidas no Esperadas.
    """
    perdidas_no_esperadas = CONFIG[RAROC][CAPITAL][METODOLOGIA_CAPITAL_PERDIDA_NO_ESPERADA][REQUERIMIENTOS_PERDIDA_NO_ESPERADA]

    return perdidas_no_esperadas


def calculate_requirements(operation_data: Dict[str, Any], metodologia) -> Tuple[float, float]:
    """
    Calculate the APR and Capital Requirements component of RAROC based on operation data.

    Parameters:
        operation_data (Dict[str, Any]): The operation data.
        metodologia: The type of methodology to calculate the Capital Requirements.

    Returns:
        Tuple[float, float]: The calculated values for APR and Capital Requirements.
    """
    exposicion = float(operation_data.get(EXPOSICION, ''))

    base_ponderador_apr_sp = BASE_PONDERADOR_APR_SP
    requerimientos = CONFIG[RAROC][CAPITAL][SUPUESTOS_CAPITAL][REQUERIMIENTOS_CAPITAL]

    if metodologia == METODOLOGIA_CAPITAL_PERDIDA_NO_ESPERADA:
        requerimientos_capital = calculate_capital_perdidas_no_esperadas() * exposicion
        apr = requerimientos_capital / requerimientos

    else:
        if metodologia == METODOLOGIA_CAPITAL_SP:
            ponderador = calculate_capital_sp(operation_data) / base_ponderador_apr_sp

        elif metodologia == METODOLOGIA_CAPITAL_BASILEA:
            ponderador = calculate_capital_basilea(operation_data)

        apr = ponderador * exposicion
        requerimientos_capital = apr * requerimientos

    return apr, requerimientos_capital


def request_sofr() -> float:
    """
    Request the SOFR.

    Returns:
        Tuple[datetime, float]: The date and value for the SOFR.
    """

    # Set up the request to the FRED API for SOFR data
    url = f"https://api.stlouisfed.org/fred/series/observations?series_id=SOFR&api_key={FRED_API_KEY}&file_type=json"

    # Make the request
    response = requests.get(url)
    sofr_data = response.json()

    # Extract the latest SOFR value
    latest_sofr = sofr_data["observations"][-1]  # Get the last observation

    value_str = latest_sofr['value']

    sofr_value = float(value_str)/CONVERSION_SOFR_PORCENTAJE

    return sofr_value


def calculate_cash_flows(operation_data: Dict[str, Any], sofr):
    """
    Calculate the cash flows for each period of the loan.

    Parameters:
    - operation_data: The operation data containing loan details.
    - sofr: The SOFR rate.

    Returns:
    - cash_flows: A pandas DataFrame containing the cash flows per period.
    """
    plazo = float(operation_data.get(PLAZO, '0'))
    spread_anual_prestamo = float(operation_data.get(SPREAD_ANUAL_PRESTAMO, '0'))
    exposicion = float(operation_data.get(EXPOSICION, '0'))
    comision_estructuracion = float(operation_data.get(COMISION_ESTRUCTURACION, '0'))
    periodo_gracia = float(operation_data.get(PERIODO_GRACIA, '0'))

    # Validate inputs
    if plazo <= 0 or exposicion <= 0:
        raise ValueError("Plazo and Exposición must be greater than zero.")

    # Number of payments (rounded up to include any fractional periods)
    num_payments = int(np.ceil(plazo * REPAGOS_ANUALES))
    period_length = 1 / REPAGOS_ANUALES  # e.g., 0.5 years for semi-annual payments

    # Payment times and period lengths
    payment_times = []
    period_lengths = []
    for i in range(num_payments):
        start_time = i * period_length
        end_time = min((i + 1) * period_length, plazo)
        payment_times.append(end_time)
        period_lengths.append(end_time - start_time)

    sofr_rate = sofr
    spread_decimal = spread_anual_prestamo / CONVERSION_PBS_PORCENTAJE
    rate_annual = sofr_rate + spread_decimal
    # Adjust rate per period for each period length
    rate_per_period = [(1 + rate_annual) ** length - 1 for length in period_lengths]

    principal = exposicion
    upfront_commission_decimal = comision_estructuracion / CONVERSION_PBS_PORCENTAJE
    upfront_commission = upfront_commission_decimal * exposicion

    # Adjust principal for upfront commission
    net_principal = principal - upfront_commission

    months_per_period = 12 / REPAGOS_ANUALES
    grace_periods = int(periodo_gracia / months_per_period)

    # Calculate principal repayment after grace period
    num_principal_payments = num_payments - grace_periods
    principal_repayment_amount = principal / num_principal_payments if num_principal_payments > 0 else 0

    principal_repayment = np.zeros(num_payments)
    interest_payment = np.zeros(num_payments)
    total_payment = np.zeros(num_payments)
    remaining_principal = principal

    for i in range(num_payments):
        if i >= grace_periods:
            # Adjust principal repayment for fractional periods
            principal_repayment[i] = principal_repayment_amount * (period_lengths[i] / period_length)
        interest_payment[i] = remaining_principal * rate_per_period[i]
        total_payment[i] = principal_repayment[i] + interest_payment[i]
        remaining_principal -= principal_repayment[i]

    cash_flows = pd.DataFrame({
        'Period': np.arange(1, num_payments + 1),
        'Time (years)': payment_times,
        'Principal Repayment': principal_repayment,
        'Interest Payment': interest_payment,
        'Total Payment': total_payment
    })

    # Include the initial cash flow (loan disbursement minus commission)
    initial_cash_flow = pd.DataFrame({
        'Period': [0],
        'Time (years)': [0],
        'Principal Repayment': [0],
        'Interest Payment': [0],
        'Total Payment': [-net_principal]
    })

    cash_flows = pd.concat([initial_cash_flow, cash_flows], ignore_index=True)

    return cash_flows


def calculate_irr(cash_flows):
    """
    Calculate the Internal Rate of Return (IRR) of the cash flows.

    Parameters:
    - cash_flows: A pandas DataFrame containing the cash flows per period.

    Returns:
    - irr: The IRR as a decimal.
    """
    irr_per_period = npf.irr(cash_flows['Total Payment'])

    irr_annual = (1 + irr_per_period) ** REPAGOS_ANUALES -1

    return irr_annual


def calculate_macaulay_duration(cash_flows, irr):
    """
    Calculate the Macaulay duration of the cash flows.

    Parameters:
    - cash_flows: A pandas DataFrame containing the cash flows per period.
    - irr: The IRR as a decimal.

    Returns:
    - macaulay_duration: The Macaulay duration in years.
    """
    # Exclude the initial cash flow
    cash_flows = cash_flows[cash_flows['Period'] > 0].copy()

    # Calculate discounted cash flows
    cash_flows['Discounted Cash Flow'] = cash_flows['Total Payment'] / (1 + irr) ** cash_flows['Time (years)']

    # Calculate weighted times
    cash_flows['Weighted Time'] = cash_flows['Time (years)'] * cash_flows['Discounted Cash Flow']

    # Calculate Macaulay duration
    macaulay_duration = cash_flows['Weighted Time'].sum() / cash_flows['Discounted Cash Flow'].sum()

    return macaulay_duration


def calculate_funding_cost(duration):
    """
    Calculate the Internal Rate of Return (IRR) of the cash flows.

    Parameters:
    - cash_flows: A pandas DataFrame containing the cash flows per period.

    Returns:
    - irr: The IRR as a decimal.
    """
    if duration < 1:
        year = COSTO_FONDEO_MIN_YEAR
    elif duration > 11:
        year = COSTO_FONDEO_MAX_YEAR
    else:
        year = str(int(duration))

    funding_cost_annual = CONFIG[RAROC][COSTO_FONDEO][year]/CONVERSION_PBS_PORCENTAJE

    return funding_cost_annual


def calculate_expected_losses(operation_data: Dict[str, Any], cash_flows, metodologia):
    """
    Calculate the expected losses.

    Parameters:
    - operation_data: The operation data.
    - cash_flows: The cash flows DataFrame.
    - metodologia: The methodology for expected losses.

    Returns:
    - expected_loss: The total expected loss.
    """
    pais = operation_data.get(PAIS, '')
    calificacion_interna_cliente = operation_data.get(CALIFICACION_INTERNA_CLIENTE, '')
    segmento_operacion = operation_data.get(SEGMENTO_OPERACION, '')
    riesgo_operacion = operation_data.get(RIESGO_OPERACION, '')

    if metodologia == PERDIDA_ESPERADA:
        default_probabilities = CONFIG[RAROC][PERDIDA_ESPERADA][PD_PERDIDA_ESPERADA]
    elif metodologia == PREVISIONES:
        pd_techo_pais = CONFIG[RAROC][PREVISIONES][PD_TECHO_PAIS][pais]
        pd_cliente = CONFIG[RAROC][PREVISIONES][PD_CLIENTE][calificacion_interna_cliente]
        default_probabilities = {}
        for key in pd_techo_pais.keys():
            value1 = pd_techo_pais[key]
            value2 = pd_cliente.get(key, 0)
            max_value = max(value1, value2)
            default_probabilities[key] = max_value

    default_probabilities = {int(k): v for k, v in default_probabilities.items()}

    # Assign each cash flow to its corresponding year
    cash_flows = cash_flows[cash_flows['Period'] > 0].copy()
    cash_flows['Year'] = cash_flows['Time (years)'].apply(lambda x: int(np.ceil(x)))

    # Aggregate principal repayments per year
    yearly_cash_flows = cash_flows.groupby('Year')['Principal Repayment'].sum().reset_index()

    # Cap years after the maximum year in default probabilities
    max_year = max(default_probabilities.keys())
    yearly_cash_flows.loc[yearly_cash_flows['Year'] > max_year, 'Year'] = max_year

    # Sum cash flows for years beyond the max year into the max year
    yearly_cash_flows = yearly_cash_flows.groupby('Year', as_index=False)['Principal Repayment'].sum()

    # Calculate expected losses
    yearly_cash_flows['Default Probability'] = yearly_cash_flows['Year'].apply(
        lambda x: default_probabilities.get(x, default_probabilities[max_year]))
    yearly_cash_flows['Expected Loss'] = yearly_cash_flows['Principal Repayment'] * yearly_cash_flows['Default Probability']

    if riesgo_operacion == RIESGO_SOBERANO:
        loss_given_default = 0
    else:
        loss_given_default = CONFIG[RAROC][LGD][segmento_operacion]

    expected_loss = sum(yearly_cash_flows['Expected Loss']) * loss_given_default

    return expected_loss


def calculate_raroc(operation_data: Dict[str, Any],
                    metodologia_perdida_esperada: str = PREVISIONES,
                    metodologia_capital: str = METODOLOGIA_CAPITAL_SP) -> float:
    """
    Calculate the RAROC value based on operation data.

    Parameters:
        operation_data (Dict[str, Any]): The operation data.
        metodologia_perdida_esperada (str): Methodology for expected losses.
        metodologia_capital (str): Methodology for capital requirements.

    Returns:
        float: The calculated RAROC value.
    """
    segmento_operacion = operation_data.get(SEGMENTO_OPERACION, '')
    plazo = float(operation_data.get(PLAZO, '0'))
    exposicion = float(operation_data.get(EXPOSICION, '0'))
    costo_operativo = CONFIG[RAROC][COSTO_OPERATIVO][COSTO]

    if not plazo or not exposicion:
        raise ValueError("Plazo and Exposición are required and must be greater than zero.")

    if segmento_operacion == 'Inversiones Patrimoniales':
        duration = plazo
        expected_losses = 0
        retorno_anual_inversion = float(operation_data.get(RETORNO_ANUAL_INVERSION, '0'))
        if not retorno_anual_inversion:
            raise ValueError("Retorno anual de inversión is required for Inversiones Patrimoniales.")
        irr = retorno_anual_inversion / CONVERSION_PBS_PORCENTAJE
    else:
        sofr = request_sofr()
        cash_flows = calculate_cash_flows(operation_data, sofr)
        irr = calculate_irr(cash_flows)
        duration = calculate_macaulay_duration(cash_flows, irr)
        expected_losses = calculate_expected_losses(operation_data, cash_flows,
                                                    metodologia=metodologia_perdida_esperada)

    funding_cost = calculate_funding_cost(duration)
    financial_margin = (irr - funding_cost) - costo_operativo - (expected_losses / exposicion)
    _, capital_requirements = calculate_requirements(operation_data, metodologia=metodologia_capital)

    if capital_requirements == 0:
        raise ValueError("Capital requirements calculated to zero, cannot divide by zero.")

    raroc_value = financial_margin / (capital_requirements / exposicion)

    return raroc_value


def conversion_raroc(operation_data: Dict[str, Any]) -> float:
    raroc = calculate_raroc(operation_data,
                            metodologia_perdida_esperada=PREVISIONES,
                            metodologia_capital=METODOLOGIA_CAPITAL_SP)
    print(raroc)

    if raroc > BANDA_SUPERIOR_RAROC:
        return 10
    elif (raroc >= BANDA_INTERMEDIA_RAROC) and (raroc <= BANDA_SUPERIOR_RAROC):
        return 9
    elif (raroc >= BANDA_INFERIOR_RAROC) and (raroc <= BANDA_INTERMEDIA_RAROC):
        return 8
    else:
        return 0

def calculate_madurez_proyecto(operation_data: Dict[str, Any]) -> float:
    """
    Calculate the madurez atribute VSP component based on operation data.

    Parameters:
        operation_data (Dict[str, Any]): The operation data.

    Returns:
        float: The calculated madurez_proyecto value.
    """
    cliente = operation_data.get(TIPO_CLIENTE, '')

    keys = [key for key in CONFIG[MADUREZ_PROYECTO][cliente][PESOS_MADUREZ].keys() if key != PESOS_MADUREZ]

    values = []
    for key in keys:
        value = calculate_weighted_value(MADUREZ_PROYECTO,
                                         cliente,
                                         PESOS_MADUREZ,
                                         key,
                                         operation_data,
                                         (operation_data.get(key, ''),))
        values.append(value)

    madurez_proyecto_value = sum(values)

    return madurez_proyecto_value


def calculate_robustez_cliente(operation_data: Dict[str, Any]) -> float:
    """
    Calculate the robustez atribute VSP component based on operation data.

    Parameters:
        operation_data (Dict[str, Any]): The operation data.

    Returns:
        float: The calculated robustez_cliente value.
    """
    cliente = operation_data.get(TIPO_CLIENTE, '')

    keys = [key for key in CONFIG[ROBUSTEZ_CLIENTE][cliente][PESOS_ROBUSTEZ].keys() if key != PESOS_ROBUSTEZ]

    values = []
    for key in keys:
        value = calculate_weighted_value(ROBUSTEZ_CLIENTE,
                                         cliente,
                                         PESOS_ROBUSTEZ,
                                         key,
                                         operation_data,
                                         (operation_data.get(key, ''),))
        values.append(value)

    robustez_cliente_value = sum(values)

    return robustez_cliente_value


def calculate_vsp_score_components(operation_data: Dict[str, Any]) -> Tuple[float, float, float, float, float]:
    """
    Calculate the VSP Score and its components based on operation data.

    Parameters:
        operation_data (Dict[str, Any]): The operation data.

    Returns:
        Tuple[float, float, float, float, float]: The calculated values for adicionalidad_e_impacto,
        raroc, robustez_cliente, madurez_proyecto, and the final score.
    """
    adicionalidad_e_impacto = calculate_adicionalidad_impacto(operation_data)
    madurez_proyecto = calculate_madurez_proyecto(operation_data)
    raroc = conversion_raroc(operation_data)
    robustez_cliente = calculate_robustez_cliente(operation_data)

    values = [adicionalidad_e_impacto, madurez_proyecto, raroc, robustez_cliente]

    pesos = list(CONFIG[PESOS_SCORE].values())

    score = sum([v * float(Fraction(p)) for v, p in zip(values, pesos)])

    return adicionalidad_e_impacto, madurez_proyecto, raroc, robustez_cliente, score
