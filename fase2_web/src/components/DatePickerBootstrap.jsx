import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function DatePickerBootstrap() {
  const [fecha, setFecha] = useState("");

  return (
    <div className="container mt-4">
      <label className="form-label fw-bold">📅 Selecciona una fecha:</label>
      <input
        type="date"
        className="form-control"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
      />
      {fecha && (
        <p className="mt-3">
          Fecha seleccionada: <strong>{fecha}</strong>
        </p>
      )}
    </div>
  );
}
