const { QueryTypes, Model } = require("sequelize");

const { Op } = require("sequelize");

const {
  conn,
  conn2,
  conn3,
  conn4,
  Partido,
  Torneo,
  Equipo,
  Predicciones,
} = require("../db");

const { partidos } = require("../utils/partidos");

const { fechaHoraActual } = require("../utils/formatearFecha");

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

    throw new Error(`Error al crear los partidos: ${error.message}`);
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
    throw new Error(`Error al cerrar los partidos: ${error.message}`);
  }
};

const cerrarPartido = async (partidos_activos, conexion, bd) => {
  let t;

  try {
    const fecha_actual = new Date();

    for (const partido of partidos_activos) {
      const fecha_hora_partido = partido.fecha_hora_partido;

      const diferenciaEnMinutos = Math.abs(
        Math.floor((fecha_actual - fecha_hora_partido) / (1000 * 60))
      );

      if (fecha_actual >= fecha_hora_partido || diferenciaEnMinutos <= 10) {
        t = await conexion.transaction();

        const cerrarPartidoBD = await conexion.query(
          `UPDATE partidos set activo = 0 WHERE partido_id = ${partido.partido_id}`,
          {
            t,
            type: QueryTypes.UPDATE,
          }
        );

        const [actualizarPrediccion, metadata] = await conexion.query(
          `UPDATE predicciones SET goles_equipo_a = 0, goles_equipo_b = 0 WHERE partido_id = ${partido.partido_id} AND (goles_equipo_a is null OR goles_equipo_b is null)`,
          {
            t,
            type: QueryTypes.UPDATE,
          }
        );

        await t.commit();

        console.log(
          `${fechaHoraActual()} - Partido ${
            partido.partido_id
          } (${bd}) cerrado, fecha y hora de inicio:`,
          fecha_hora_partido.toLocaleString()
        );

        console.log(
          `${fechaHoraActual()} - Se actualizaron ${metadata} predicciones del partido ${
            partido.partido_id
          } (${bd})`
        );
      }
    }
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error(`Error al cerrar los partidos: ${error.message}`);
  }
};

const prediccionesFaltantes = async (partido_id_participado) => {
  try {
    const partidosConPrediccionesFaltantes = await Partido.findAll({
      where: {
        tipo_partido: {
          [Op.ne]: "Fase de grupos",
        },
      },
    });

    const predicciones = await Predicciones.findAll({
      where: {
        partido_id: partido_id_participado,
      },
    });

    if (partidosConPrediccionesFaltantes && predicciones) {
      for (const prediccion of predicciones) {
        let predicciones_creadas = 0;

        for (const partido of partidosConPrediccionesFaltantes) {
          const prediccion_faltante = await Predicciones.findOne({
            where: {
              empleado_id: prediccion.empleado_id,
              partido_id: partido.partido_id,
            },
          });

          if (!prediccion_faltante) {
            const [prediccionFaltante, created] =
              await Predicciones.findOrCreate({
                where: {
                  empleado_id: prediccion.empleado_id,
                  partido_id: partido.partido_id,
                },
                defaults: {
                  empleado_id: prediccion.empleado_id,
                  partido_id: partido.partido_id,
                },
              });

            if (created) {
              predicciones_creadas++;
            }
          }
        }

        console.log(
          `${fechaHoraActual()} - Se crearon ${predicciones_creadas} predicciones para el empleado ID: ${
            prediccion.empleado_id
          }`
        );
      }
    }
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error(`Error al crear predicciones faltantes: ${error.message}`);
  }
};

module.exports = {
  cargarPartidos,
  cerrarPartidos,
  prediccionesFaltantes,
};
