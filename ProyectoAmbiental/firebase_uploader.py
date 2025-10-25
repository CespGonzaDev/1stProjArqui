# firebase_uploader.py
# -----------------------------------------------
# Sube los datos del archivo CSV a Firebase Realtime Database
# -----------------------------------------------

import firebase_admin
from firebase_admin import credentials, db
import pandas as pd

# --- Configuración de Firebase ---
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://medidorambiental-c8bc1-default-rtdb.firebaseio.com/"
})

# --- Cargar CSV ---
df = pd.read_csv("datos_sinteticos.csv")

# --- Subida de datos ---
ref = db.reference("variables_ambientales")

print("🔄 Subiendo datos a Firebase...")
for _, row in df.iterrows():
    data = {
        "fecha": row["fecha"],
        "hora": row["hora"],
        "temperatura": row["temperatura"],
        "humedad": row["humedad"],
        "radiacion": row["radiacion"]
    }
    ref.push(data)

print("✅ Datos subidos correctamente a Firebase.")