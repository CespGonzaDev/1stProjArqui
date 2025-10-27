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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">Controles de consulta</h3>

      {/* Selección de rango */}
      <label className="block mb-1 dark:text-gray-100">Rango de fechas</label>
      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <span className="text-sm text-gray-600 dark:text-gray-300">Desde</span>
          <input
            type="date"
            value={fecha.inicio}
            onChange={e => setFecha({ ...fecha, inicio: e.target.value })}
            className="border border-blue-200 rounded-lg p-2 w-full 
           bg-white/80 text-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300
           focus:outline-none focus:ring-2 focus:ring-blue-400 
           dark:bg-gray-800 dark:text-gray-100"
             style={{ colorScheme: 'light' }}
             
          />
        </div>
        <div className="flex-1">
          <span className="text-sm text-gray-600 dark:text-gray-300">Hasta</span>
          <input
            type="date"
            value={fecha.fin}
            onChange={e => setFecha({ ...fecha, fin: e.target.value })}
            className="border border-blue-300 rounded-md p-2 w-full 
             bg-blue-50 text-gray-900 
             focus:outline-none focus:ring-2 focus:ring-blue-400 
             shadow-sm"
             style={{ colorScheme: 'light' }}
          />
        </div>
      </div>

      {/* Variable a consultar */}
      <label className="block mb-1 dark:text-gray-100">Variable a consultar</label>
      <select
        value={variable}
        onChange={e => setVariable(e.target.value)}
        className="border border-blue-300 rounded-md p-2 w-full 
             bg-blue-50 text-gray-900 
             focus:outline-none focus:ring-2 focus:ring-blue-400 
             shadow-sm"
             style={{ colorScheme: 'light' }}
      >
        <option value="">-- Selecciona una variable --</option>
        <option value="temperatura">Temperatura °C</option>
        <option value="humedad">Humedad</option>
        <option value="radiacion">Radiación W/m²</option>
        <option value="todas">TODAS</option>
      </select>

      {/* Checkboxes de opciones */}
      <div className="space-y-2 mb-3">
        <label className="flex items-center gap-2 dark:text-gray-100">
          <input
            type="checkbox"
            checked={promedioHora}
            onChange={e => setPromedioHora(e.target.checked)}
            className="accent-blue-500"
          />
          Promedio por hora (día)
        </label>
        <label className="flex items-center gap-2 dark:text-gray-100">
          <input
            type="checkbox"
            checked={promedioDia}
            onChange={e => setPromedioDia(e.target.checked)}
            className="accent-blue-500"
          />
          Promedio por día (rango)
        </label>
        <label className="flex items-center gap-2 dark:text-gray-100">
          <input
            type="checkbox"
            checked={maxMin}
            onChange={e => setMaxMin(e.target.checked)}
            className="accent-blue-500"
          />
          Máximo / Mínimo histórico
        </label>
      </div>

      {/* Botón consultar */}
      <button
        onClick={handleConsultar}
        disabled={!puedeConsultar}
        style={{
           background: puedeConsultar
            ? "linear-gradient(to right, #facc15, #ca8a04)" // amarillo degradado
            : "#9ca3af", // gris si está deshabilitado
          color: puedeConsultar ? "black" : "white", // texto oscuro sobre amarillo
          fontWeight: "600",
          padding: "10px 16px",
          borderRadius: "10px",
          boxShadow: puedeConsultar
            ? "0 4px 10px rgba(250, 204, 21, 0.5)" // sombra dorada
            : "none",
          cursor: puedeConsultar ? "pointer" : "not-allowed",
          transition: "all 0.3s ease-in-out",
        }}
        onMouseEnter={(e) => {
          if (puedeConsultar) {
            e.target.style.background = "linear-gradient(to right, #eab308, #a16207)"; // más oscuro al pasar
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
  );
}
