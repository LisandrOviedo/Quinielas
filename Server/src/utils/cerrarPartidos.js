const { QueryTypes } = require("sequelize");

const cerrarPartido = async (partidos_activos, conexion) => {
  let t;

  try {
    const fecha_actual = new Date();

    for (const partido of partidos_activos) {
      const fecha_hora_partido = partido.fecha_hora_partido;

      const diferencia = Math.abs(fecha_actual - fecha_hora_partido) / 1000; // Diferencia en segundos

      if (fecha_actual >= fecha_hora_partido || diferencia <= 300) {
        const predicciones_faltantes = await conexion.query(
          `SELECT * FROM predicciones WHERE partido_id = ${partido.partido_id} AND (goles_equipo_a is null OR goles_equipo_b is null)`,
          {
            type: QueryTypes.SELECT,
          }
        );

        if (predicciones_faltantes) {
          for (const prediccion of predicciones_faltantes) {
            t = await conexion.transaction();

            const actualizarPrediccion = await conexion.query(
              `UPDATE predicciones SET goles_equipo_a = 0, goles_equipo_b = 0 WHERE partido_id = ${partido.partido_id} AND empleado_id = ${prediccion.empleado_id}`,
              {
                t,
                type: QueryTypes.UPDATE,
              }
            );

            await t.commit();

            console.log(
              `Predicción ${prediccion.prediccion_id} actualizada a 0-0`
            );
          }
        }

        t = await conexion.transaction();

        const cerrarPartidoBD = await conexion.query(
          `UPDATE partidos set activo = 0 WHERE partido_id = ${partido.partido_id}`,
          {
            t,
            type: QueryTypes.UPDATE,
          }
        );

        await t.commit();

        console.log(
          `Partido ${partido.partido_id} cerrado, ya que su fecha y hora es:`,
          fecha_hora_partido.toLocaleString()
        );
      }
    }
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error("Error al cerrar los partidos: " + error.message);
  }
};

module.exports = {
  cerrarPartido,
};
