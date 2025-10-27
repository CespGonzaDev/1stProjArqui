import { useState } from "react";
import ControlsPanel from "./components/ControlsPanel";
import DataTable from "./components/DataTable";
import ChartPanel from "./components/ChartPanel";
import { getLecturasPorRangoRTDB } from "./firebaseQueries";
import { exportarResultadosPDF } from "./components/exportarPDF";

export default function App() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("📊 CONSULTAR y generar automáticamente si no hay datos");
  const [variableActual, setVariableActual] = useState(""); // ← NUEVO: guardamos la variable seleccionada

  // CONSULTAR (y generar automáticamente si no hay datos)
  const handleConsultar = async (filtros) => {
    const { fecha, variable, promedioHora, promedioDia, maxMin } = filtros;
    setVariableActual(variable); // ← NUEVO: guardamos la variable para pasarla al gráfico

    try {
      setCargando(true);
      setMensaje("⏳ Consultando...");

      let res = await getLecturasPorRangoRTDB(fecha.inicio, fecha.fin);

      // Generación automática si no hay datos
      if (!res.length) {
        setMensaje("⚠️ Buscando Datos...");
        const resp = await fetch(
          `http://127.0.0.1:5000/generar_datos?inicio=${fecha.inicio}&fin=${fecha.fin}`
        );
        const json = await resp.json();
        if (json.datos) {
          setMensaje(
            `✅ Generados ${json.total_registros} registros del ${fecha.inicio} al ${fecha.fin}.`
          );
          res = json.datos;
        } else {
          setMensaje("❌ No se encontraron datos.");
          return;
        }
      }

      // Normaliza: asegura números
      res = res.map((r) => ({
        ...r,
        temperatura: Number(r.temperatura),
        humedad: Number(r.humedad),
        radiacion: Number(r.radiacion),
      }));

      // Filtra por variable: otras → null
      const keepOnly = (r) => {
        if (variable === "temperatura") return { ...r, humedad: null, radiacion: null };
        if (variable === "humedad") return { ...r, temperatura: null, radiacion: null };
        if (variable === "radiacion") return { ...r, temperatura: null, humedad: null };
        if (variable === "todas") return r; // ← NUEVO: mantiene todas las variables
        return r;
      };
      let salida = res.map(keepOnly);

      const msgs = [];
      const unSoloDia = fecha.inicio === fecha.fin;

      // Promedio por hora
      if (promedioHora) {
      if (unSoloDia) {
        const agrup = {};
        res.forEach((r) => {
          if (!agrup[r.hora]) agrup[r.hora] = [];
          agrup[r.hora].push(r);      
        });
        const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
        const promediosHora = Object.entries(agrup).map(([hora, arr]) => {
          if (variable === "todas") {
            return {
              fecha: fecha.inicio,
              hora,
              temperatura: avg(arr.map(x => x.temperatura).filter(Number.isFinite)),
              humedad:     avg(arr.map(x => x.humedad).filter(Number.isFinite)),
              radiacion:   avg(arr.map(x => x.radiacion).filter(Number.isFinite)),
            };
          } else {
            const valores = arr.map(x => x[variable]).filter(Number.isFinite);
            return {
              fecha: fecha.inicio,
              hora,
              temperatura: variable === "temperatura" ? avg(valores) : null,
              humedad:     variable === "humedad"     ? avg(valores) : null,
              radiacion:   variable === "radiacion"   ? avg(valores) : null,
            };
          }
        });
        salida = promediosHora;
        msgs.push("📊 Promedio por hora.");
      } else {
        msgs.push("ℹ️ 'Promedio por hora' requiere un solo día; se ignora.");
      }
    }
                

      // Promedio por día
      if (promedioDia) {
        const agrupD = {};
        res.forEach((r) => {
          if (!agrupD[r.fecha]) agrupD[r.fecha] = [];
          agrupD[r.fecha].push(r);
        });
        const promediosDia = Object.entries(agrupD).map(([f, arr]) => {
          const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
          if (variable === "todas") {
            return {
              fecha: f,
              hora: "",
              temperatura: avg(arr.map(x => x.temperatura).filter(Number.isFinite)),
              humedad:     avg(arr.map(x => x.humedad).filter(Number.isFinite)),
              radiacion:   avg(arr.map(x => x.radiacion).filter(Number.isFinite)),
            };
          } else {
            const valores = arr.map(x => x[variable]).filter(Number.isFinite);
            return {
              fecha: f,
              hora: "",
              temperatura: variable === "temperatura" ? avg(valores) : null,
              humedad:     variable === "humedad"     ? avg(valores) : null,
              radiacion:   variable === "radiacion"   ? avg(valores) : null,
            };
          }
        });
        if (!unSoloDia || !promedioHora) {
          salida = promediosDia;
          msgs.push("📊 Promedio por día.");
        }
      }


      // Máximo / Mínimo
      // 4) Máximo / Mínimo
      let extremos = null;
      if (maxMin) {
        const calcExt = (arr, key) => {
          const vals = arr.map(r => r[key]).filter(Number.isFinite);
          if (!vals.length) return null;
          return { max: Math.max(...vals), min: Math.min(...vals) };
        };

        if (variable === "todas") {
          const t = calcExt(res, "temperatura");
          const h = calcExt(res, "humedad");
          const r = calcExt(res, "radiacion");
          extremos = [];

          if (t) {
            extremos.push(
              { tipo: "Máximo T", fecha: "", hora: "", temperatura: t.max, humedad: null, radiacion: null },
              { tipo: "Mínimo T", fecha: "", hora: "", temperatura: t.min, humedad: null, radiacion: null }
            );
          }
          if (h) {
            extremos.push(
              { tipo: "Máximo H", fecha: "", hora: "", temperatura: null, humedad: h.max, radiacion: null },
              { tipo: "Mínimo H", fecha: "", hora: "", temperatura: null, humedad: h.min, radiacion: null }
            );
          }
          if (r) {
            extremos.push(
              { tipo: "Máximo R", fecha: "", hora: "", temperatura: null, humedad: null, radiacion: r.max },
              { tipo: "Mínimo R", fecha: "", hora: "", temperatura: null, humedad: null, radiacion: r.min }
            );
          }
        } else {
          const vals = res.map((r) => r[variable]).filter(Number.isFinite);
          if (vals.length) {
            const max = Math.max(...vals);
            const min = Math.min(...vals);
            extremos = [
              {
                tipo: "Máximo",
                fecha: "",
                hora: "",
                temperatura: variable === "temperatura" ? max : null,
                humedad:     variable === "humedad"     ? max : null,
                radiacion:   variable === "radiacion"   ? max : null,
              },
              {
                tipo: "Mínimo",
                fecha: "",
                hora: "",
                temperatura: variable === "temperatura" ? min : null,
                humedad:     variable === "humedad"     ? min : null,
                radiacion:   variable === "radiacion"   ? min : null,
              },
            ];
          }
        }
        msgs.push("📈 Máx/Mín incluidos.");
      }

      

      if (extremos && extremos.length) {
        salida = [...salida, ...extremos];
      }
      if (!promedioHora && !promedioDia && !maxMin) {
        msgs.push("✅ Datos crudos del rango.");
      }

      setDatos(salida);
      setMensaje(msgs.join(" "));
    } catch (e) {
      console.error(e);
      setMensaje("❌ Error al consultar o generar datos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 dark:text-white">
          ☁️ Consultas Ambientales IoT
        </h1>

        <ControlsPanel onConsultar={handleConsultar} />

        {/* Mensaje de estado */}
        {mensaje && (
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mt-4 text-center">
            <p className="text-blue-800 dark:text-blue-100">{mensaje}</p>
          </div>
        )}

        {/* Loading */}
        {cargando && (
          <div className="text-center mt-4">
            <p className="text-gray-600 dark:text-gray-300">Cargando...</p>
          </div>
        )}

        {/* Resultados */}
        {!cargando && datos.length > 0 && (
          <>
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3 dark:text-white">📋 Resultados</h2>
              <DataTable rows={datos} />
              <button
                onClick={() => exportarResultadosPDF(datos)}
                className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
              >
                📄 Exportar a PDF
              </button>
            </div>
            <ChartPanel datos={datos} variable={variableActual} /> {/* ← NUEVO: pasamos variable */}
          </>
        )}
      </div>
    </div>
  );
}
