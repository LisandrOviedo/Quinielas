/**
 * <b>Funciones relacionadas a la tabla de posiciones</b>
 * @module "src/utils/tablaPosiciones.js"
 */

const fs = require("fs");

const { fechaHoraActual } = require("./formatearFecha");

/**
 * <b>Función que verifica si una ruta existe, sino, la crea</b>
 * @param {string} folderPath Ruta a validar (C:\Users\Lisandro\Desktop\Quinielas\Server\src\utils\reportes)
 */
const crearCarpetaSiNoExiste = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    try {
      fs.mkdirSync(folderPath, { recursive: true });
    } catch (err) {
      console.error(
        `${fechaHoraActual()} - Error al crear la carpeta "${folderPath}":`,
        err
      );
    }
  }
};

/**
 * <b>Función que recibe una predicción de un partido de un empleado y el resultado del partido para esa predicción y calcula el puntaje total para esa predicción según el resultado del partido</b>
 * @param {Object} prediccion Predicción de un partido de un empleado
 * @param {Object} resultado_partido Resultado del partido para esa predicción
 * @returns {Promise<Object>} <b>{ usuario_id: "1", nombres: "Lisandro", apellidos: "Oviedo", puntaje: "999", fecha_prediccion: "2024-07-04 15:38:00" }</b>
 */
const calcularPuntos = async (prediccion, resultado_partido) => {
  let puntos = 0;

  if (
    (prediccion.goles_equipo_a > prediccion.goles_equipo_b &&
      resultado_partido.Resultado_Partido.goles_equipo_a >
        resultado_partido.Resultado_Partido.goles_equipo_b) ||
    (prediccion.goles_equipo_b > prediccion.goles_equipo_a &&
      resultado_partido.Resultado_Partido.goles_equipo_b >
        resultado_partido.Resultado_Partido.goles_equipo_a) ||
    (prediccion.goles_equipo_a === prediccion.goles_equipo_b &&
      resultado_partido.Resultado_Partido.goles_equipo_a ===
        resultado_partido.Resultado_Partido.goles_equipo_b)
  ) {
    // Si predije ganar un equipo y ganó un equipo ó si predije empate y quedó empate

    if (resultado_partido.tipo_partido === "Fase de grupos") {
      puntos = puntos + 5;
    } else {
      puntos = puntos + 10;
    }
  }

  if (
    prediccion.goles_equipo_a ===
      resultado_partido.Resultado_Partido.goles_equipo_a &&
    prediccion.goles_equipo_b ===
      resultado_partido.Resultado_Partido.goles_equipo_b
  ) {
    // Si acerté los goles de ambos equipos

    if (resultado_partido.tipo_partido === "Fase de grupos") {
      puntos = puntos + 2;
    } else {
      puntos = puntos + 4;
    }
  }

  if (
    prediccion.goles_equipo_a - prediccion.goles_equipo_b ===
    resultado_partido.Resultado_Partido.goles_equipo_a -
      resultado_partido.Resultado_Partido.goles_equipo_b
  ) {
    // Si acerté la diferencia de goles de ambos equipos

    if (resultado_partido.tipo_partido === "Fase de grupos") {
      puntos = puntos + 1;
    } else {
      puntos = puntos + 2;
    }
  }

  const resultado = {
    usuario_id: prediccion.Empleado.empleado_id,
    nombres: prediccion.Empleado.nombres.trim(),
    apellidos: prediccion.Empleado.apellidos.trim(),
    puntaje: puntos,
    fecha_prediccion: prediccion.updatedAt,
  };

  return resultado;
};

module.exports = {
  crearCarpetaSiNoExiste,
  calcularPuntos,
};
