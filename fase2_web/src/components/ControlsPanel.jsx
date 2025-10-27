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
            className="border rounded p-2 w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
        <div className="flex-1">
          <span className="text-sm text-gray-600 dark:text-gray-300">Hasta</span>
          <input
            type="date"
            value={fecha.fin}
            onChange={e => setFecha({ ...fecha, fin: e.target.value })}
            className="border rounded p-2 w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Variable a consultar */}
      <label className="block mb-1 dark:text-gray-100">Variable a consultar</label>
      <select
        value={variable}
        onChange={e => setVariable(e.target.value)}
        className="border rounded p-2 w-full mb-3 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
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
          />
          Promedio por hora (día)
        </label>
        <label className="flex items-center gap-2 dark:text-gray-100">
          <input
            type="checkbox"
            checked={promedioDia}
            onChange={e => setPromedioDia(e.target.checked)}
          />
          Promedio por día (rango)
        </label>
        <label className="flex items-center gap-2 dark:text-gray-100">
          <input
            type="checkbox"
            checked={maxMin}
            onChange={e => setMaxMin(e.target.checked)}
          />
          Máximo / Mínimo histórico
        </label>
      </div>

      {/* Botón consultar */}
      <button
        onClick={handleConsultar}
        disabled={!puedeConsultar}
        className={`w-full p-2 rounded font-semibold transition ${
          puedeConsultar
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        }`}
      >
        🔍 Consultar
      </button>
    </div>
  );
}
