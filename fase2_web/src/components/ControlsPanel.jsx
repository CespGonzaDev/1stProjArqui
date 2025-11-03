import { useState } from "react";

export default function ControlsPanel({ onConsultar }) {
  const [fecha, setFecha] = useState({ inicio: "", fin: "" });
  const [variable, setVariable] = useState("");
  const [promedioHora, setPromedioHora] = useState(false);
  const [promedioDia, setPromedioDia] = useState(false);
  const [maxMin, setMaxMin] = useState(false);

  const rangoValido = fecha.inicio && fecha.fin && fecha.inicio <= fecha.fin;
  const puedeConsultar = rangoValido && !!variable;

  const handleConsultar = () => {
    if (!puedeConsultar) {
      alert("⚠️ Selecciona un rango válido y una variable.");
      return;
    }
    onConsultar({ fecha, variable, promedioHora, promedioDia, maxMin });
  };

return (
  <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl p-6 md:p-8 backdrop-blur-md">
    

    {/* Selección de rango */}
    <div className="textRango">
      <h3 className="text-xl md:text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
      Rangos de fechas
      </h3>
    </div>

    {/* 📱 En móviles apilado, en pantallas grandes horizontal */}
    <div className="fechas">
      <div className="flex flex-col items-center sm:items-start flex-1">
        <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-1">Desde:</h3>
        <input
          type="date"
          value={fecha.inicio}
          onChange={e => setFecha({ ...fecha, inicio: e.target.value })}
          class="textHasta"
          style={{ colorScheme: 'light' }}
        />
      </div>

      <div className="divHasta">
        <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-1">Hasta:</h3>
        <input
          type="date"
          value={fecha.fin}
          onChange={e => setFecha({ ...fecha, fin: e.target.value })}
          class="textHasta"
          style={{ colorScheme: 'light' }}
        />
      </div>
    </div>

    {/* Variable a consultar */}
    <div>
      <h1 className="titulo">
      Variable a consultar
    </h1>
    </div>
    

    <div className="divselect">
      <select
        value={variable}
        onChange={e => setVariable(e.target.value)}
        className="border border-blue-300 rounded-md p-2 w-full sm:w-64 bg-white/80 text-gray-900 
                   focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
        style={{ colorScheme: 'light' }}
      >
        <option value="">-- Selecciona una variable --</option>
        <option value="temperatura">Temperatura (°C)</option>
        <option value="humedad">Humedad (%)</option>
        <option value="radiacion">Radiación (W/m²)</option>
        <option value="todas">TODAS</option>
      </select>
    </div>

    {/* Checkboxes de opciones */}
    <div className="divcheckboxP">
      <h3 className="text-xl md:text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
        <input
          type="checkbox"
          checked={promedioHora}
          onChange={e => setPromedioHora(e.target.checked)}
          className="accent-blue-500 w-5 h-5"
        />
        Promedio por hora (día)
      </h3>

      <h3 className="text-xl md:text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
        <input
          type="checkbox"
          checked={promedioDia}
          onChange={e => setPromedioDia(e.target.checked)}
          className="accent-blue-500 w-5 h-5"
        />
        Promedio por día (rango)
      </h3>

      <h3 className="text-xl md:text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
        <input
          type="checkbox"
          checked={maxMin}
          onChange={e => setMaxMin(e.target.checked)}
          className="accent-blue-500 w-5 h-5"
        />
        Máximo / Mínimo histórico
      </h3>
    </div>

    {/* Botón consultar */}
    <div className="divConsultar">
      <button
        onClick={handleConsultar}
        disabled={!puedeConsultar}
        style={{
          background: puedeConsultar
            ? "linear-gradient(to right, #facc15, #ca8a04)"
            : "#9ca3af",
          color: puedeConsultar ? "black" : "white",
          fontWeight: "600",
          padding: "10px 16px",
          borderRadius: "10px",
          boxShadow: puedeConsultar
            ? "0 4px 10px rgba(250, 204, 21, 0.5)"
            : "none",
          cursor: puedeConsultar ? "pointer" : "not-allowed",
          transition: "all 0.3s ease-in-out",
          width: "100%",
          maxWidth: "220px",
        }}
        onMouseEnter={(e) => {
          if (puedeConsultar) {
            e.target.style.background = "linear-gradient(to right, #eab308, #a16207)";
            e.target.style.transform = "scale(1.05)";
          }
        }}
        onMouseLeave={(e) => {
          if (puedeConsultar) {
            e.target.style.background = "linear-gradient(to right, #facc15, #ca8a04)";
            e.target.style.transform = "scale(1)";
          }
        }}
      >
        🔍 Consultar
      </button>
    </div>
  </div>
);
}
