// fase2_web/src/components/ExportarPDF.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportarResultadosPDF(datos) {
  const doc = new jsPDF();

  if (!datos || datos.length === 0) {
    doc.text("No hay datos para exportar.", 14, 20);
  } else {
    const rows = datos.map(d => [
      d.fecha ?? "",
      d.hora ?? "",
      d.temperatura ?? "",
      d.humedad ?? "",
      d.radiacion ?? ""
    ]);
    autoTable(doc, {
      head: [["Fecha", "Hora", "Temperatura (°C)", "Humedad (%)", "Radiación (W/m²)"]],
      body: rows,
      startY: 20
    });
  }

  doc.save("exportacion_IoT.pdf");
}
