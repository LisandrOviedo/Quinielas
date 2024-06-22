const fs = require("fs");

const crearCarpetaSiNoExiste = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    try {
      fs.mkdirSync(folderPath, { recursive: true });
    } catch (err) {
      console.error(`Error al crear la carpeta "${folderPath}":`, err);
    }
  }
};

const calcularPuntos = async (prediccion, resultado_partido) => {
  let puntos = 0;

  if (
    (prediccion.goles_equipo_a > prediccion.goles_equipo_b &&
      resultado_partido.goles_equipo_a > resultado_partido.goles_equipo_b) ||
    (prediccion.goles_equipo_b > prediccion.goles_equipo_a &&
      resultado_partido.goles_equipo_b > resultado_partido.goles_equipo_a) ||
    (prediccion.goles_equipo_a === prediccion.goles_equipo_b &&
      resultado_partido.goles_equipo_a === resultado_partido.goles_equipo_b)
  ) {
    // Si predije ganar un equipo y ganó un equipo ó si predije empate y quedó empate
    puntos = puntos + 5;
  }

  if (
    prediccion.goles_equipo_a === resultado_partido.goles_equipo_a &&
    prediccion.goles_equipo_b === resultado_partido.goles_equipo_b
  ) {
    // Si acerté los goles de ambos equipos
    puntos = puntos + 2;
  }

  if (
    Math.abs(prediccion.goles_equipo_a - prediccion.goles_equipo_b) ===
    Math.abs(
      resultado_partido.goles_equipo_a - resultado_partido.goles_equipo_b
    )
  ) {
    puntos = puntos + 1;
  }

  const resultado = {
    usuario_id: prediccion.Empleado.empleado_id,
    nombres: prediccion.Empleado.nombres.trim(),
    apellidos: prediccion.Empleado.apellidos.trim(),
    puntaje: puntos,
  };

  return resultado;
};

module.exports = {
  crearCarpetaSiNoExiste,
  calcularPuntos,
};
