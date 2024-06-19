const textoCapitalizado = (string) => {
  return string.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase().trim();
  });
};

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
  textoCapitalizado,
  ordenarNombresAPI,
  ordenarDireccionesAPI,
};
