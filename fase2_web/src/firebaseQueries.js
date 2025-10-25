import { rtdb } from "./firebaseConfig";
import { ref, get, query, orderByChild } from "firebase/database";

export async function getLecturasPorRangoRTDB(inicioISO, finISO) {
  try {
    console.log("🔎 Consultando rango:", inicioISO, "→", finISO);

    const q = query(ref(rtdb, "variables_ambientales"), orderByChild("fecha"));
    const snap = await get(q);

    if (!snap.exists()) {
      console.warn("⚠️ No hay datos de esa fecha.");
      return [];
    }

    // Convertimos a array de objetos
    const data = Object.values(snap.val());

    // Filtramos los registros dentro del rango (inclusive)
    const enRango = data.filter((r) => {
      return r.fecha >= inicioISO && r.fecha <= finISO;
    });

    console.log(`✅ ${enRango.length} registros dentro del rango.`);
    return enRango;
  } catch (error) {
    console.error("❌ Error al consultar :", error);
    throw error;
  }
}
