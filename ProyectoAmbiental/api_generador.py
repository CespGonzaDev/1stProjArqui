# api_generador.py
# -----------------------------------------------
# API que genera datos sintéticos bajo demanda y los sube a Firebase
# -----------------------------------------------

from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import math
from datetime import datetime, timedelta
from flask_cors import CORS
from firebase_admin import credentials, db
import firebase_admin
import os  

app = Flask(__name__)
CORS(app)

# Inicializar Firebase (una sola vez)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
key_path = os.path.join(BASE_DIR, "serviceAccountKey.json")

cred = credentials.Certificate(key_path)
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://medidorambiental-c8bc1-default-rtdb.firebaseio.com"
})
# -----------------------------------------------
# Generador de datos sintéticos
# -----------------------------------------------
def generar_datos_para_fecha(fecha_solicitada):
    fecha_inicio = datetime.strptime(fecha_solicitada, "%Y-%m-%d")
    intervalo = timedelta(minutes=30)

    fechas, horas, temperaturas, humedades, radiaciones = [], [], [], [], []

    for i in range(48):  # 24 horas / 0.5 horas = 48 registros
        actual = fecha_inicio + i * intervalo
        hora_decimal = actual.hour + actual.minute / 60.0

        # Temperatura
        temp = 22 + 6 * math.sin((hora_decimal - 6) * math.pi / 12) + np.random.uniform(-0.5, 0.5)
        temp = max(18, min(30, temp))

        # Humedad
        hum = 70 - 20 * math.sin((hora_decimal - 6) * math.pi / 12) + np.random.uniform(-2, 2)
        hum = max(40, min(90, hum))

        # Radiación
        if 6 <= actual.hour <= 18:
            rad = 1000 * math.sin((hora_decimal - 6) * math.pi / 12) + np.random.uniform(-50, 50)
            rad = max(0, rad)
        else:
            rad = 0

        fechas.append(actual.strftime("%Y-%m-%d"))
        horas.append(actual.strftime("%H:%M"))
        temperaturas.append(round(temp, 2))
        humedades.append(round(hum, 2))
        radiaciones.append(round(rad, 2))

    df = pd.DataFrame({
        "fecha": fechas,
        "hora": horas,
        "temperatura": temperaturas,
        "humedad": humedades,
        "radiacion": radiaciones
    })

    return df

# -----------------------------------------------
# Endpoint Flask para generar y subir datos
# -----------------------------------------------
@app.route('/generar_datos', methods=['GET'])
def generar_datos():
    fecha_inicio = request.args.get("inicio")
    fecha_fin = request.args.get("fin")

    if not fecha_inicio:
        return jsonify({"error": "Debe indicar al menos la fecha de inicio, ej: /generar_datos?inicio=2025-10-10"}), 400

    try:
        registros = []
        fecha_actual = datetime.strptime(fecha_inicio, "%Y-%m-%d")
        fecha_limite = datetime.strptime(fecha_fin, "%Y-%m-%d") if fecha_fin else fecha_actual

        # 🔹 Generar datos día por día
        while fecha_actual <= fecha_limite:
            fecha_str = fecha_actual.strftime("%Y-%m-%d")
            df = generar_datos_para_fecha(fecha_str)
            registros.extend(df.to_dict(orient="records"))
            fecha_actual += timedelta(days=1)

        # 🔹 Subir todos los registros a Firebase
        ref = db.reference("variables_ambientales")
        for registro in registros:
            ref.push(registro)

        return jsonify({
            "inicio": fecha_inicio,
            "fin": fecha_fin,
            "total_registros": len(registros),
            "datos": registros
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------------------------
# Ejecución del servidor Flask
# -----------------------------------------------
if __name__ == "__main__":
    print("🚀 Servidor Flask ejecutándose en http://127.0.0.1:5000")
    app.run(port=5000, debug=True)
