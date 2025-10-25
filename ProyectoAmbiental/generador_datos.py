# generador_datos.py
# -----------------------------------------------
# Genera datos sintéticos coherentes para variables ambientales
# y los guarda en un archivo CSV local.
# -----------------------------------------------

import pandas as pd
import numpy as np
import math
from datetime import datetime, timedelta

# --- Configuración de fechas ---
fecha_inicio = datetime(2025, 10, 1, 0, 0)
fecha_fin = datetime(2025, 10, 10, 23, 59)
intervalo = timedelta(minutes=30)

# --- Listas para almacenar datos ---
fechas, horas, temperaturas, humedades, radiaciones = [], [], [], [], []

# --- Generación de datos sintéticos ---
fecha_actual = fecha_inicio
while fecha_actual <= fecha_fin:
    hora_decimal = fecha_actual.hour + fecha_actual.minute / 60.0

    # Temperatura: patrón senoidal diurno
    temp = 22 + 6 * math.sin((hora_decimal - 6) * math.pi / 12) + np.random.uniform(-0.5, 0.5)
    temp = max(18, min(30, temp))

    # Humedad: inversa al patrón de temperatura
    hum = 70 - 20 * math.sin((hora_decimal - 6) * math.pi / 12) + np.random.uniform(-2, 2)
    hum = max(40, min(90, hum))

    # Radiación: solo entre 6:00 y 18:00
    if 6 <= fecha_actual.hour <= 18:
        rad = 1000 * math.sin((hora_decimal - 6) * math.pi / 12) + np.random.uniform(-50, 50)
        rad = max(0, rad)
    else:
        rad = 0

    fechas.append(fecha_actual.strftime("%Y-%m-%d"))
    horas.append(fecha_actual.strftime("%H:%M"))
    temperaturas.append(round(temp, 2))
    humedades.append(round(hum, 2))
    radiaciones.append(round(rad, 2))

    fecha_actual += intervalo

# --- Crear DataFrame y guardar ---
df = pd.DataFrame({
    "fecha": fechas,
    "hora": horas,
    "temperatura": temperaturas,
    "humedad": humedades,
    "radiacion": radiaciones
})

df.to_csv("datos_sinteticos.csv", index=False)
print("✅ Archivo 'datos_sinteticos.csv' generado correctamente con", len(df), "registros.")