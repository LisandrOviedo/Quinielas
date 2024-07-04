/**
 * <b>Funciones relacionadas a formateo de fechas</b>
 * @module "src/utils/formatearFecha.js"
 */

/**
 * <b>Función que recibe la fecha de nacimiento de un empleado de la API y la retorna en formato YYYY/MM/DD</b>
 * @param {string} fecha Fecha de nacimiento de la API (Tue, 24 Nov 1998 00:00:00 GMT)
 * @returns {string} <b>"1998/11/24"</b>
 */
const YYYYMMDD = (fecha) => {
  const date = new Date(fecha);

  return date.toISOString().slice(0, 10);
};

/**
 * <b>Función que retorna la fecha y hora actual del sistema</b>
 * @returns {string} <b>"[4/7/2024, 02:40:00 p.m.]"</b>
 */
const fechaHoraActual = () => {
  return `[${new Date().toLocaleString()}]`;
};

module.exports = {
  YYYYMMDD,
  fechaHoraActual,
};
