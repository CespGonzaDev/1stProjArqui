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
 // const [cargando, setCargando] = useState(false);
  const [variableActual, setVariableActual] = useState(""); 
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
      // 🔹 Compara las fechas sin importar formato ni zona horaria
      const unSoloDia =
        new Date(fecha.inicio).toDateString() === new Date(fecha.fin).toDateString();


      // Promedio por hora
      if (promedioHora) {
        if (unSoloDia) {
          // Agrupar por la hora entera (ej. "08" en lugar de "08:30")
          const agrup = {};
          res.forEach(r => {
            const horaEntera = r.hora.slice(0, 2); // "00", "01", "02", etc.
            if (!agrup[horaEntera]) agrup[horaEntera] = [];
            agrup[horaEntera].push(Number(r[variable]));
          });

          // Calcular promedios de cada hora
          let promediosHora = Object.entries(agrup).map(([h, vals]) => ({
            fecha: fecha.inicio,
            hora: `${h}:00`,
            temperatura: variable === "temperatura" ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : null,
            humedad:     variable === "humedad" ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : null,
            radiacion:   variable === "radiacion" ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : null,
          }));

          // 🔹 Ordenar las horas correctamente (00, 01, 02, ... 23)
          promediosHora.sort((a, b) => {
            const horaA = parseInt(a.hora.split(":")[0]);
            const horaB = parseInt(b.hora.split(":")[0]);
            return horaA - horaB;
          });

          salida = promediosHora;
          msgs.push("📊 Promedio por hora (ordenado y agrupado correctamente).");
        } else {
          msgs.push("ℹ️ ‘Promedio por hora’ requiere un solo día; se ignora.");
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
  <div
    className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center p-6"
    style={{
      backgroundImage: "url('/pexels-francesco-ungaro-281260.jpg')", // tu imagen de fondo
    }}
  >
    <div>
      <h1 className="titulo">
      🌤️ Consultas Ambientales IoT
    </h1>
    
    </div>


    
    <div className="bg-white/85 dark:bg-gray-900/80 rounded-2xl shadow-2xl backdrop-blur-md p-10 w-full max-w-4xl">
      {/* Panel de controles */}
      <ControlsPanel onConsultar={handleConsultar} />

      {/* Mensaje dinámico */}
      {mensaje && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mt-6 text-center">
          <p className="text-blue-800 dark:text-blue-100 font-medium">{mensaje}</p>
        </div>
      )}

      {/* Loading */}
      {cargando && (
        <div className="text-center mt-4">
          <p className="text-gray-700 dark:text-gray-300">Cargando...</p>
        </div>
      )}

      {/* Resultados */}
      {!cargando && datos.length > 0 && (
        <>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-3 dark:text-white text-gray-800 text-center">
              📋 Resultados
            </h2>
            <ChartPanel datos={datos} variable={variableActual} />
            

            {/* Botón Exportar PDF */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => exportarResultadosPDF(datos)}
                style={{
                  background: "linear-gradient(to right, #ef4444, #b91c1c)", // 🔴 rojo degradado
                  color: "white",
                  fontWeight: "600",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 10px rgba(239, 68, 68, 0.5)", // sombra roja
                  cursor: "pointer",
                  transition: "all 0.3s ease-in-out",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background =
                    "linear-gradient(to right, #dc2626, #7f1d1d)"; // más oscuro al pasar
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background =
                    "linear-gradient(to right, #ef4444, #b91c1c)";
                  e.target.style.transform = "scale(1)";
                }}
              >
                📄 Exportar a PDF
              </button>
            </div>
          </div>

          {/* Gráfico */}
          <DataTable rows={datos} />
          
        </>
      )}
    </div>
  </div>
);
}
