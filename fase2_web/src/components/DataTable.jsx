export default function DataTable({ rows }) {
  if (!rows?.length) return <p className="text-gray-600 dark:text-gray-300">No hay datos para mostrar.</p>;

  const mostrarTemperatura = rows.some(r => r.temperatura !== "");
  const mostrarHumedad = rows.some(r => r.humedad !== "");
  const mostrarRadiacion = rows.some(r => r.radiacion !== "");
  

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="p-2 text-left">Fecha</th>
            <th className="p-2 text-left">Hora</th>
            {mostrarTemperatura && <th className="p-2 text-left">Temperatura</th>}
            {mostrarHumedad && <th className="p-2 text-left">Humedad</th>}
            {mostrarRadiacion && <th className="p-2 text-left">Radiación</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
              <td className="p-2">{r.fecha}</td>
              <td className="p-2">{r.hora}</td>
              {mostrarTemperatura && <td className="p-2">{r.temperatura}</td>}
              {mostrarHumedad && <td className="p-2">{r.humedad}</td>}
              {mostrarRadiacion && <td className="p-2">{r.radiacion}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
