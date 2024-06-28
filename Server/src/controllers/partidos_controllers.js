const { QueryTypes } = require("sequelize");

const { conn2, conn3, conn4, Partido, Torneo, Equipo } = require("../db");

const { partidos } = require("../utils/partidos");

const cargarPartidos = async () => {
  let t;

  try {
    let torneo = await Torneo.findOne({
      where: {
        nombre: "Copa América 2024",
      },
    });

    for (const partido of partidos) {
      t = await conn.transaction();

      let equipo_a = await Equipo.findOne({
        where: {
          nombre: partido.equipo_a,
        },
      });

      let equipo_b = await Equipo.findOne({
        where: {
          nombre: partido.equipo_b,
        },
      });

      const [crearPartido, created] = await Partido.findOrCreate({
        where: {
          torneo_id: torneo.torneo_id,
          tipo_partido: partido.tipo_partido,
          numero_jornada: partido.numero_jornada,
          equipo_a: equipo_a.equipo_id,
          equipo_b: equipo_b.equipo_id,
        },
        defaults: {
          torneo_id: torneo.torneo_id,
          tipo_partido: partido.tipo_partido,
          numero_jornada: partido.numero_jornada,
          equipo_a: equipo_a.equipo_id,
          equipo_b: equipo_b.equipo_id,
          fecha_hora_partido: partido.fecha_hora_partido,
        },
        transaction: t,
      });

      await t.commit();
    }
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error("Error al crear los partidos: " + error.message);
  }
};

const cerrarPartidos = async () => {
  try {
    const partidos_activos = await conn2.query(
      "SELECT * FROM partidos WHERE activo = 1",
      {
        type: QueryTypes.SELECT,
      }
    );

    const partidos_activos2 = await conn3.query(
      "SELECT * FROM partidos WHERE activo = 1",
      {
        type: QueryTypes.SELECT,
      }
    );

    const partidos_activos3 = await conn4.query(
      "SELECT * FROM partidos WHERE activo = 1",
      {
        type: QueryTypes.SELECT,
      }
    );

    if (partidos_activos) {
      const bd = "Copa América LAMAR";
      await cerrarPartido(partidos_activos, conn2, bd);
    }

    if (partidos_activos2) {
      const bd = "Copa América Claros";

      await cerrarPartido(partidos_activos2, conn3, bd);
    }

    if (partidos_activos3) {
      const bd = "EURO Copa Claros";

      await cerrarPartido(partidos_activos3, conn4, bd);
    }
  } catch (error) {
    throw new Error("Error al cerrar los partidos: " + error.message);
  }
};

const cerrarPartido = async (partidos_activos, conexion, bd) => {
  let t;

  try {
    const fecha_actual = new Date();

    for (const partido of partidos_activos) {
      const fecha_hora_partido = partido.fecha_hora_partido;

      const diferencia = Math.abs(fecha_actual - fecha_hora_partido) / 1000; // Diferencia en segundos

      if (fecha_actual >= fecha_hora_partido || diferencia <= 300) {
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
          `Partido ${partido.partido_id} (${bd}) cerrado, inició / inicia:`,
          fecha_hora_partido.toLocaleString()
        );

        const predicciones_faltantes = await conexion.query(
          `SELECT * FROM predicciones WHERE partido_id = ${partido.partido_id} AND (goles_equipo_a is null OR goles_equipo_b is null)`,
          {
            type: QueryTypes.SELECT,
          }
        );

        if (predicciones_faltantes) {
          let conteo = 0;

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

            conteo++;
          }

          console.log(
            `Se actualizaron ${conteo} predicciones del partido ${partido.partido_id} (${bd})`
          );
        }
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
  cargarPartidos,
  cerrarPartidos,
};
