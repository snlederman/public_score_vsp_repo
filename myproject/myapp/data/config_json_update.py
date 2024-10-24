import pandas as pd
import json
import unicodedata
import numpy as np


config_file = '../config.json'

# Define the sector and subsector structure
subSectoresEconomicos = {
    'Administración pública': [
        'Gobierno central',
        'Gobierno subnacional',
        'GovTech',
        'Otros - Gob',
        'NA'
    ],
    'Agricultura ganadería pesca y silvicultura': [
        'Agricultura, ganadería, pesca y silvicultura',
        'Irrigación',
        'Otros - Agricultura',
        'NA'
    ],
    'Agua saneamiento preservación de recursos hídricos y gestión de residuos': [
        'Agua, saneamiento, preservación de recursos hídricos y gestión de residuos'
    ],
    'Educación cultura y deporte': [
        'Educación',
        'Infraestructura educativa',
        'Cultura',
        'Deporte',
        'Otros - Educación',
        'NA'
    ],
    'Energía e industrias extractivas': [
        'Minería',
        'Petróleo',
        'Gas',
        'Generación de energía renovable (hidroeléctrica, solar, eólica, biomasa, geotérmica)',
        'Generación de energía no renovable',
        'Otros - Energía',
        'NA'
    ],
    'Industria comercio y servicios': [
        'Comercio',
        'Construcción',
        'Manufactura',
        'Servicios',
        'Hotelería y turismo',
        'Otros - Industria',
        'NA'
    ],
    'Protección y servicios sociales': [
        'Protección social',
        'Desarrollo urbano',
        'Otros - Servicios Sociales',
        'NA'
    ],
    'Salud': [
        'Salud',
        'Infraestructura de salud',
        'Otros - Salud',
        'NA'
    ],
    'Sector financiero': [
        'Banca de desarrollo',
        'Banca comercial',
        'Microfinanzas',
        'FinTech',
        'Otros - Finc',
        'NA'
    ],
    'Tecnologías de la información y la comunicación': [
        'Tecnologías de la información y la comunicación',
        'NA'
    ],
    'Transporte': [
        'Transporte',
        'NA'
    ],
    'Transversal': [
        'NA'
    ]
}

# Define the full instrument names
instrument_names = [
    'Avales y Garantias',
    'Inversiones Patrimoniales',
    'Línea de Crédito',
    'Préstamos Corporativos',
    'Programas y Proyectos de Inversión (PPI)'
]

# Define a mapping for special country names
special_country_names = {
    'CAF)': 'Multinacional (al menos 2 países CAF)',
    'CAF': 'País(es) No CAF',
    'Dominicana': 'República Dominicana',
    'Rica': 'Costa Rica',
    'Salvador': 'El Salvador',
    'Tobago': 'Trinidad y Tobago'
}

# File paths
excel_file = './data_dadmi.xlsx'


def read_config(config_file):
    # Read the existing config.json file
    with open(config_file, 'r', encoding='utf-8') as file:
        return json.load(file)


def write_config(config_file, config_data):
    # Write the updated config data back to the config.json file
    with open(config_file, 'w', encoding='utf-8') as file:
        json.dump(config_data, file, ensure_ascii=False, indent=4)


def build_nested_dict_from_df(df, mapping_spec):
    """
    Builds a nested dictionary from a DataFrame, given a mapping specification.
    mapping_spec is a dictionary with keys:
    - 'keys': list of column names to use as keys (in order)
    - 'value': column name to use as value
    - 'key_transforms': optional list of functions to transform keys
    - 'value_transform': optional function to transform values
    """
    keys = mapping_spec['keys']
    value_col = mapping_spec['value']
    key_transforms = mapping_spec.get('key_transforms', [lambda x: x] * len(keys))
    value_transform = mapping_spec.get('value_transform', lambda x: x)

    nested_dict = {}
    for index, row in df.iterrows():
        current_dict = nested_dict
        for i, key_col in enumerate(keys):
            key = row[key_col]
            if pd.isna(key):
                key = ''
            key = str(key).strip()
            key = key_transforms[i](key)
            if i == len(keys) - 1:
                # Last key, set the value
                value = row[value_col]
                value = value_transform(value)

                # **Convert NumPy data types to native Python types**
                if isinstance(value, np.integer):
                    value = int(value)
                elif isinstance(value, np.floating):
                    value = float(value)
                elif isinstance(value, np.ndarray):
                    value = value.tolist()

                current_dict[key] = value
            else:
                if key not in current_dict:
                    current_dict[key] = {}
                current_dict = current_dict[key]
    return nested_dict


def data_frame(excel_file, sheet_name):
    # Read the Excel file
    df = pd.read_excel(excel_file, sheet_name=sheet_name, header=0)

    return df

def update_config_generic(excel_file, sheet_name, config_file, config_path, mapping_spec):
    # Read the Excel file
    df = data_frame(excel_file, sheet_name)

    # If 'preprocess' function is provided, apply it to df
    if 'preprocess' in mapping_spec:
        df = mapping_spec['preprocess'](df)

    # Build the nested dictionary
    nested_dict = build_nested_dict_from_df(df, mapping_spec)

    # Read the config data
    config_data = read_config(config_file)

    # Navigate to config_path
    current_config = config_data
    for key in config_path[:-1]:
        current_config = current_config.setdefault(key, {})
    # Update the data at the last key
    current_config[config_path[-1]] = nested_dict

    # Write back to config file
    write_config(config_file, config_data)


def get_sector(subsector, subSectoresEconomicos):
    for sector, subsectors in subSectoresEconomicos.items():
        if subsector in subsectors:
            return sector
    return 'Unknown'


def remove_accents(input_str):
    if not isinstance(input_str, str):
        return ''
    nkfd_form = unicodedata.normalize('NFKD', input_str)
    return ''.join([c for c in nkfd_form if not unicodedata.combining(c)])


def get_sector(subsector, subSectoresEconomicos):
    subsector_norm = remove_accents(subsector.strip().lower())
    for sector, subsectors in subSectoresEconomicos.items():
        for s in subsectors:
            s_norm = remove_accents(s.strip().lower())
            if subsector_norm == s_norm:
                return sector
    return 'Unknown'


# Update 'pesos' sheet (simple key-value)
update_config_generic(
    excel_file=excel_file,
    sheet_name='pesos',
    config_file=config_file,
    config_path=['adicionalidad_impacto', 'premides', 'pesos_premides'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'pesos').columns[0]],
        'value': data_frame(excel_file, 'pesos').columns[1],
        'value_transform': lambda x: x
    }
)

# Update 'alineacion_vsp' sheet (simple key-value with value transform)
update_config_generic(
    excel_file=excel_file,
    sheet_name='alineacion_vsp',
    config_file=config_file,
    config_path=['adicionalidad_impacto', 'premides', 'alineacion_estrategia_vsp'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'alineacion_vsp').columns[0]],
        'value':data_frame(excel_file, 'alineacion_vsp').columns[1],
        'value_transform': lambda x: x / 10
    }
)

# Update 'potencial_impacto' sheet
update_config_generic(
    excel_file=excel_file,
    sheet_name='potencial_impacto',
    config_file=config_file,
    config_path=['adicionalidad_impacto', 'premides', 'potencial_impacto'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'potencial_impacto').columns[0]],
        'value': data_frame(excel_file, 'potencial_impacto').columns[1],
        'value_transform': lambda x: x / 10
    }
)

# Update 'estado_derecho' sheet
update_config_generic(
    excel_file=excel_file,
    sheet_name='estado_derecho',
    config_file=config_file,
    config_path=['adicionalidad_impacto', 'premides', 'indice_estado_de_derecho'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'estado_derecho').columns[0]],
        'value': data_frame(excel_file, 'estado_derecho').columns[1],
        'value_transform': lambda x: x / 10
    }
)

# Update 'brecha_desempleo' sheet
update_config_generic(
    excel_file=excel_file,
    sheet_name='brecha_desempleo',
    config_file=config_file,
    config_path=['adicionalidad_impacto', 'premides', 'brecha_desempleo'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'brecha_desempleo').columns[0]],
        'value': data_frame(excel_file, 'brecha_desempleo').columns[1],
        'value_transform': lambda x: x / 10
    }
)


# Update 'ods' sheet (reshape required)
def preprocess_ods(df):
    # Melt the DataFrame to long format
    df_long = df.melt(id_vars=[df.columns[0]], var_name='ODS', value_name='Value')
    return df_long


update_config_generic(
    excel_file=excel_file,
    sheet_name='ods',
    config_file=config_file,
    config_path=['adicionalidad_impacto', 'premides', 'aportes_al_desarrollo'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'ods').columns[0], 'ODS'],
        'value': 'Value',
        'value_transform': lambda x: 10 - x / 10,
        'preprocess': preprocess_ods
    }
)


# Update 'alineacion_pais' sheet (complex nesting with sectors and subsectors)
def preprocess_alineacion_pais(df):
    # Rename the first column to 'Subsector'
    df = df.rename(columns={df.columns[0]: 'Subsector'})

    # Melt the DataFrame to long format
    df_long = pd.melt(df, id_vars=['Subsector'], var_name='Country', value_name='Value')

    # Clean up country names
    df_long['Country'] = df_long['Country'].apply(lambda x: special_country_names.get(str(x).strip().split()[-1], str(x).strip().split()[-1]))

    # Handle NaN Subsector values
    df_long['Subsector'] = df_long['Subsector'].fillna('').astype(str)

    # Map subsectors to sectors using the updated get_sector function
    df_long['Sector'] = df_long['Subsector'].apply(lambda x: get_sector(x, subSectoresEconomicos))

    return df_long


update_config_generic(
    excel_file=excel_file,
    sheet_name='alineacion_pais',
    config_file=config_file,
    config_path=['adicionalidad_impacto', 'premides', 'alineacion_estrategia_pais'],
    mapping_spec={
        'keys': ['Country', 'Sector', 'Subsector'],
        'value': 'Value',
        'value_transform': lambda x: x * 10,
        'preprocess': preprocess_alineacion_pais
    }
)


# Update 'instrumentos' sheet (complex nesting with instruments, sectors, and subsectors)
def preprocess_instrumentos(df):
    # Read the Excel file starting from header row 1
    df = df.reset_index(drop=True)
    df.columns = df.iloc[0]  # Set the header row
    df = df[1:]  # Skip the header row
    df = df.reset_index(drop=True)

    # Rename the first column to 'Subsector'
    df = df.rename(columns={df.columns[0]: 'Subsector'})

    data = []
    current_country = None

    num_instruments = len(instrument_names)

    for i in range(1, len(df.columns)):
        col_name = str(df.columns[i])

        # Check if the column header is a new country or an unnamed column
        if "Unnamed" not in col_name:
            # New country starts here
            current_country = col_name.strip().split()[-1]
            if current_country in special_country_names:
                current_country = special_country_names[current_country]
            # No need to reset instrument index here

        # Assign instrument based on the column index
        instrument = instrument_names[(i - 1) % num_instruments]

        # Process each row for the current column
        for index, row in df.iterrows():
            subsector = str(row['Subsector']).strip()
            sector = get_sector(subsector, subSectoresEconomicos)
            value = row[df.columns[i]]
            # Handle missing or NaN values
            if pd.isna(value):
                value = 0.0
            else:
                value = value  # Apply value transformation here

            data.append({
                'Country': current_country,
                'Instrument': instrument,
                'Sector': sector,
                'Subsector': subsector,
                'Value': value
            })

    df_long = pd.DataFrame(data)
    return df_long


update_config_generic(
    excel_file=excel_file,
    sheet_name='instrumentos',
    config_file=config_file,
    config_path=['adicionalidad_impacto', 'premides', 'opinion_equipo'],
    mapping_spec={
        'keys': ['Country', 'Instrument', 'Sector', 'Subsector'],
        'value': 'Value',
        'value_transform': lambda x: x / 5 * 10,
        'preprocess': preprocess_instrumentos
    }
)


excel_file = './data_riesgos.xlsx'

update_config_generic(
    excel_file=excel_file,
    sheet_name='supuestos_capital',
    config_file=config_file,
    config_path=['raroc', 'capital', 'supuestos_capital'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'supuestos_capital').columns[0]],
        'value': data_frame(excel_file, 'supuestos_capital').columns[1],
        'value_transform': lambda x: x
    }
)


def preprocess_segmento_rwa(df):
    # Melt the DataFrame to long format
    df_long = df.melt(id_vars=[df.columns[0]], var_name='Componentes', value_name='Value')
    return df_long


update_config_generic(
    excel_file=excel_file,
    sheet_name='segmento_rwa',
    config_file=config_file,
    config_path=['raroc', 'capital', 'sp', 'segmento_rwa'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'segmento_rwa').columns[0], 'Componentes'],
        'value': 'Value',
        'value_transform': lambda x: x,
        'preprocess': preprocess_segmento_rwa
    }
)


def preprocess_rwa(df):
    # Melt the DataFrame to long format
    df_long = df.melt(id_vars=[df.columns[0]], var_name='Puntuación', value_name='Value')
    return df_long


update_config_generic(
    excel_file=excel_file,
    sheet_name='rwa',
    config_file=config_file,
    config_path=['raroc', 'capital', 'sp', 'rwa'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'rwa').columns[0], 'Puntuación'],
        'value': 'Value',
        'value_transform': lambda x: x,
        'preprocess': preprocess_rwa
    }
)


def preprocess_rwa_soberano(df):
    # Melt the DataFrame to long format
    df_long = df.melt(id_vars=[df.columns[0]], var_name='Categoría', value_name='Value')
    return df_long


update_config_generic(
    excel_file=excel_file,
    sheet_name='rwa_soberano',
    config_file=config_file,
    config_path=['raroc', 'capital', 'sp', 'tipo_rwa', 'rwa_soberano'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'rwa_soberano').columns[0], 'Categoría'],
        'value':'Value',
        'value_transform': lambda x: x,
        'preprocess': preprocess_rwa_soberano
    }
)


update_config_generic(
    excel_file=excel_file,
    sheet_name='rwa_cuasi_soberano',
    config_file=config_file,
    config_path=['raroc', 'capital', 'sp', 'tipo_rwa', 'rwa_cuasi_soberano'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'rwa_cuasi_soberano').columns[0]],
        'value': data_frame(excel_file, 'rwa_cuasi_soberano').columns[1],
        'value_transform': lambda x: x
    }
)


update_config_generic(
    excel_file=excel_file,
    sheet_name='rwa_patrimoniales',
    config_file=config_file,
    config_path=['raroc', 'capital', 'sp', 'tipo_rwa', 'rwa_patrimoniales'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'rwa_patrimoniales').columns[0]],
        'value': data_frame(excel_file, 'rwa_patrimoniales').columns[1],
        'value_transform': lambda x: x
    }
)


update_config_generic(
    excel_file=excel_file,
    sheet_name='rwa_financieras',
    config_file=config_file,
    config_path=['raroc', 'capital', 'sp', 'tipo_rwa', 'rwa_financieras'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'rwa_financieras').columns[0]],
        'value': data_frame(excel_file, 'rwa_financieras').columns[1],
        'value_transform': lambda x: x
    }
)


update_config_generic(
    excel_file=excel_file,
    sheet_name='rwa_otros',
    config_file=config_file,
    config_path=['raroc', 'capital', 'sp', 'tipo_rwa', 'rwa_otros'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'rwa_otros').columns[0]],
        'value': data_frame(excel_file, 'rwa_otros').columns[1],
        'value_transform': lambda x: x
    }
)


def preprocess_basilea_rating_externo(df):
    # Melt the DataFrame to long format
    df_long = df.melt(id_vars=[df.columns[0]], var_name='Segmento', value_name='Value')
    return df_long


update_config_generic(
    excel_file=excel_file,
    sheet_name='basilea_rating_externo',
    config_file=config_file,
    config_path=['raroc', 'capital', 'basilea', 'basilea_rating_externo'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'basilea_rating_externo').columns[0], 'Segmento'],
        'value':'Value',
        'value_transform': lambda x: x,
        'preprocess': preprocess_basilea_rating_externo
    }
)


def preprocess_basilea_rating_interno(df):
    # Melt the DataFrame to long format
    df_long = df.melt(id_vars=[df.columns[0]], var_name='Segmento', value_name='Value')
    return df_long


update_config_generic(
    excel_file=excel_file,
    sheet_name='basilea_rating_interno',
    config_file=config_file,
    config_path=['raroc', 'capital', 'basilea', 'basilea_rating_interno'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'basilea_rating_interno').columns[0], 'Segmento'],
        'value':'Value',
        'value_transform': lambda x: x,
        'preprocess': preprocess_basilea_rating_interno
    }
)


update_config_generic(
    excel_file=excel_file,
    sheet_name='perdida_no_esperada',
    config_file=config_file,
    config_path=['raroc', 'capital', 'perdida_no_esperada'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'perdida_no_esperada').columns[0]],
        'value': data_frame(excel_file, 'perdida_no_esperada').columns[1],
        'value_transform': lambda x: x
    }
)


def preprocess_pd_techo_pais(df):
    # Melt the DataFrame to long format
    df_long = df.melt(id_vars=[df.columns[0]], var_name='PD', value_name='Value')
    return df_long


update_config_generic(
    excel_file=excel_file,
    sheet_name='pd_techo_pais',
    config_file=config_file,
    config_path=['raroc', 'previsiones', 'pd_techo_pais'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'pd_techo_pais').columns[0], 'PD'],
        'value':'Value',
        'value_transform': lambda x: x,
        'preprocess': preprocess_pd_techo_pais
    }
)


def preprocess_pd_cliente(df):
    # Melt the DataFrame to long format
    df_long = df.melt(id_vars=[df.columns[0]], var_name='PD', value_name='Value')
    return df_long


update_config_generic(
    excel_file=excel_file,
    sheet_name='pd_cliente',
    config_file=config_file,
    config_path=['raroc', 'previsiones', 'pd_cliente'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'pd_cliente').columns[0], 'PD'],
        'value':'Value',
        'value_transform': lambda x: x,
        'preprocess': preprocess_pd_cliente
    }
)


update_config_generic(
    excel_file=excel_file,
    sheet_name='pd_perdida_esperada',
    config_file=config_file,
    config_path=['raroc', 'perdida_esperada', 'pd_perdida_esperada'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'pd_perdida_esperada').columns[0]],
        'value': data_frame(excel_file, 'pd_perdida_esperada').columns[1],
        'key_transforms': [lambda x: int(float(x))],
        'value_transform': lambda x: x
    }
)


update_config_generic(
    excel_file=excel_file,
    sheet_name='lgd',
    config_file=config_file,
    config_path=['raroc', 'lgd'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'lgd').columns[0]],
        'value': data_frame(excel_file, 'lgd').columns[1],
        'value_transform': lambda x: x
    }
)


update_config_generic(
    excel_file=excel_file,
    sheet_name='costo_fondeo',
    config_file=config_file,
    config_path=['raroc', 'costo_fondeo'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'costo_fondeo').columns[0]],
        'value': data_frame(excel_file, 'costo_fondeo').columns[1],
        'key_transforms': [lambda x: int(float(x))],
        'value_transform': lambda x: x
    }
)


update_config_generic(
    excel_file=excel_file,
    sheet_name='costo_operativo',
    config_file=config_file,
    config_path=['raroc', 'costo_operativo'],
    mapping_spec={
        'keys': [data_frame(excel_file, 'costo_operativo').columns[0]],
        'value': data_frame(excel_file, 'costo_operativo').columns[1],
        'value_transform': lambda x: x
    }
)
