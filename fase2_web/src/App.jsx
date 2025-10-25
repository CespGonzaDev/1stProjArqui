import { useState } from "react";
import ControlsPanel from "./components/ControlsPanel";
import DataTable from "./components/DataTable";
import ChartPanel from "./components/ChartPanel";
import { getLecturasPorRangoRTDB } from "./firebaseQueries";
import { exportarResultadosPDF } from "./components/exportarPDF";  




export default function App() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  


  // 🔹 CONSULTAR (y generar automáticamente si no hay datos)
  const handleConsultar = async (filtros) => {
    const { fecha, variable, promedioHora, promedioDia, maxMin } = filtros;

    try {
      setCargando(true);
      setMensaje("⏳ Consultando...");

      let res = await getLecturasPorRangoRTDB(fecha.inicio, fecha.fin);

      // 🔹 Si no hay datos, genera automáticamente con Flask
      if (!res.length) {
        setMensaje("⚠️ Buscando Datos...");
        const resp = await fetch(`http://127.0.0.1:5000/generar_datos?inicio=${fecha.inicio}&fin=${fecha.fin}`);
        const json = await resp.json();

        if (json.datos) {
          setMensaje(`✅ Generados ${json.total_registros} registros del ${fecha.inicio} al ${fecha.fin}.`);
          res = json.datos;
        } else {
          setMensaje("❌ No se encontraron datos.");
          return;
        }
      }

      // 🔹 Filtrar por variable seleccionada
      let datosFiltrados = res;
      if (variable === "temperatura") {
        datosFiltrados = res.map(r => ({ ...r, humedad: "", radiacion: "" }));
      } else if (variable === "humedad") {
        datosFiltrados = res.map(r => ({ ...r, temperatura: "", radiacion: "" }));
      } else if (variable === "radiacion") {
        datosFiltrados = res.map(r => ({ ...r, temperatura: "", humedad: "" }));
      }

      // 🔹 Mostrar resultado final
      setDatos(datosFiltrados);
      setMensaje(`✅ ${datosFiltrados.length} registros listos para visualizar.`);
    } catch (error) {
      console.error("❌ Error consultando :", error);
      setMensaje("❌ Error al consultar o datos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6 dark:text-gray-100 text-center">
        🌤️ Consultas Ambientales IoT
      </h1>

      <div className="max-w-5xl mx-auto">
        {/* Panel de control */}
        <div className="mb-6">
          <ControlsPanel onConsultar={handleConsultar} />
        </div>

        {/* Mensajes dinámicos */}
        <div
          className={`mb-3 text-sm text-center font-semibold ${
            mensaje.includes("✅")
              ? "text-green-500"
              : mensaje.includes("⚠️")
              ? "text-yellow-500"
              : mensaje.includes("❌")
              ? "text-red-500"
              : "text-gray-300"
          }`}
        >
          {mensaje}
        </div>

        {/* Contenido principal */}
        {cargando ? (
          <div className="text-gray-700 dark:text-gray-300 text-center">⏳ Cargando...</div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold mb-2 dark:text-gray-100">📋 Resultados</h2>
              <DataTable rows={datos} />
            </div>
            <ChartPanel datos={datos} />
            <button onClick={() => exportarResultadosPDF(datos)}>
              Exportar a PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/*
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1>Hola mundo</h1>

        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
*/