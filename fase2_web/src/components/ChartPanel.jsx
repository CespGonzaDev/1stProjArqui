import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ChartPanel({ datos, variable }) {
  if (!datos || datos.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mt-6">
      <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">Gráfica</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hora" />
          <YAxis />
          <Tooltip />
          <Legend />
          {(variable === "temperatura" || variable === "todas") && (
            <Line
              type="monotone"
              dataKey="temperatura"
              stroke="#ef4444"
              dot={false}
              name="Temperatura (°C)"
            />
          )}
          {(variable === "humedad" || variable === "todas") && (
            <Line
              type="monotone"
              dataKey="humedad"
              stroke="#3b82f6"
              dot={false}
              name="Humedad (%)"
            />
          )}
          {(variable === "radiacion" || variable === "todas") && (
            <Line
              type="monotone"
              dataKey="radiacion"
              stroke="#facc15"
              dot={false}
              name="Radiación (W/m²)"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
