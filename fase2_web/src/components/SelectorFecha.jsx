import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


export default function SelectorFecha({ fecha, setFecha }) {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <label className="font-semibold text-gray-800 dark:text-gray-100">
        📅 Selecciona una fecha:
      </label>
      <DatePicker
        selected={fecha}            
        onChange={(date) => setFecha(date)}
        dateFormat="yyyy-MM-dd"
        className="border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100"
        placeholderText="Elige una fecha"
      />
    </div>
  );
}
