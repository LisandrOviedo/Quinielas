/**
 * <b>Funciones relacionadas a formateo de textos</b>
 * @module "src/utils/formatearTexto.js"
 */

/**
 * <b>Función que recibe un nombre o apellido de un empleado de la API</b>
 * <ul>
 * <li>Elimina todo lo que no sean espacios en blanco, letras sin acento, letras con acento y guiones</li>
 * <li>Elimina los espacios en blanco dobles o más consecutivos existentes y los espacios en blanco al principio y final</li>
 * <li>Capitaliza el texto</li>
 * </ul>
 * @param {string} string Nombre o apellido de la API ( LISANDRO     oviedo?.)
 * @returns {string} <b>"Lisandro Oviedo"</b>
 */
const ordenarNombresAPI = (string) => {
  // Expresión regular para eliminar todo lo que no sean espacios en blanco, letras sin acento, letras con acento y guiones
  const regex = /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s-&0-9.]/g;

  // Reemplazar los caracteres que no cumplan con la expresión regular por una cadena vacía
  let sanitizedStr = string.replace(regex, "").trim();

  // Reemplazar los espacios en blanco dobles o más consecutivos por un solo espacio
  sanitizedStr = sanitizedStr.replace(/\s{2,}/g, " ");

  // Convertir la primera letra de cada palabra a mayúscula y el resto a minúscula
  sanitizedStr = sanitizedStr.replace(
    /\b\w+/g,
    (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
  );

  return sanitizedStr;
};

/**
 * <b>Función que recibe una dirección (vivienda) de un empleado de la API</b>
 * <ul>
 * <li>Elimina los espacios en blanco dobles o más consecutivos existentes y los espacios en blanco al principio y final</li>
 * <li>Capitaliza el texto</li>
 * </ul>
 * @param {string} string Dirección de la API (Venezuela,  zuliA, Maracaibo   )
 * @returns {string} <b>"Venezuela, Zulia, Maracaibo"</b>
 */
const ordenarDireccionesAPI = (string) => {
  // Reemplazar los espacios en blanco dobles o más consecutivos por un solo espacio
  let sanitizedStr = string.replace(/\s{2,}/g, " ").trim();

  // Convertir la primera letra de cada palabra a mayúscula y el resto a minúscula
  sanitizedStr = sanitizedStr.replace(
    /\b\w+/g,
    (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
  );

  return sanitizedStr;
};

module.exports = {
  ordenarNombresAPI,
  ordenarDireccionesAPI,
};
