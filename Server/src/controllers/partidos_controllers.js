/**
 * <b>Funciones relacionadas a los partidos</b>
 * @module "src/controllers/partidos_controllers.js"
 */

const { QueryTypes } = require("sequelize");

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

/**
 * <b>Función para cargar los partidos desde un arreglo</b>
 */
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

      // @ts-ignore
      const [crearPartido, created] = await Partido.findOrCreate({
        where: {
          // @ts-ignore
          torneo_id: torneo.torneo_id,
          tipo_partido: partido.tipo_partido,
          numero_jornada: partido.numero_jornada,
          // @ts-ignore
          equipo_a: equipo_a.equipo_id,
          // @ts-ignore
          equipo_b: equipo_b.equipo_id,
        },
        defaults: {
          // @ts-ignore
          torneo_id: torneo.torneo_id,
          tipo_partido: partido.tipo_partido,
          numero_jornada: partido.numero_jornada,
          // @ts-ignore
          equipo_a: equipo_a.equipo_id,
          // @ts-ignore
          equipo_b: equipo_b.equipo_id,
          fecha_hora_partido: partido.fecha_hora_partido,
        },
        transaction: t,
      });

      await t.commit();
    }
  } catch (error) {
    // @ts-ignore
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error(`Error al crear los partidos: ${error.message}`);
  }
};

/**
 * <b>Función para cerrar todos los partidos activos y con fecha_hora_partido iniciado o 10 minutos por iniciar, de todas las bases de datos</b>
 */
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

/**
 * <b>Función que recibe los partidos activos, la conexión hacia esa base de datos y un nombre para identificar la base de datos o el torneo</b>
 * <ul>
 * <li>Obtiene la fecha y hora actual del sistema y compara con la fecha y hora de inicio de cada partido</li>
 * <li>Si la fecha y hora actual del sistema es mayor a la fecha y hora de inicio del partido, cierra el partido</li>
 * <li>Si la fecha y hora actual del sistema es inferior por 10 minutos a la fecha y hora de inicio del partido, cierra el partido</li>
 * </ul>
 * @param {Array<Object>} partidos_activos Arreglo de partidos activos
 * @param {*} conexion Conexión hacia la base de datos de esos partidos activos
 * @param {string} bd Nombre de la base de datos o torneo
 */
const cerrarPartido = async (partidos_activos, conexion, bd) => {
  let t;

  try {
    const fecha_actual = new Date();

    for (const partido of partidos_activos) {
      const fecha_hora_partido = partido.fecha_hora_partido;

      const diferenciaEnMinutos = Math.abs(
        // @ts-ignore
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

        // const [actualizarPrediccion, metadata] = await conexion.query(
        //   `UPDATE predicciones SET goles_equipo_a = 0, goles_equipo_b = 0 WHERE partido_id = ${partido.partido_id} AND (goles_equipo_a is null OR goles_equipo_b is null)`,
        //   {
        //     t,
        //     type: QueryTypes.UPDATE,
        //   }
        // );

        await t.commit();

        console.log(
          `${fechaHoraActual()} - Partido ${
            partido.partido_id
          } (${bd}) cerrado, fecha y hora de inicio:`,
          fecha_hora_partido.toLocaleString()
        );

        // console.log(
        //   `${fechaHoraActual()} - Se actualizaron ${metadata} predicciones del partido ${
        //     partido.partido_id
        //   } (${bd})`
        // );
      }
    }
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error(`Error al cerrar los partidos: ${error.message}`);
  }
};

/**
 * <b>Función que consulta todos los empleados que participaron en un partido e inserta registros en la tabla "predicciones" de otros tipos de partido con goles en nulo</b>
 * @param {number} partido_id_participado ID del partido a consultar última predicción como referencia de que un empleado participó
 * @param {string} tipo_partido_participado Tipo de partido participado
 */
const prediccionesFaltantes = async (
  partido_id_participado,
  tipo_partido_participado
) => {
  let t;

  try {
    const partidosConPrediccionesFaltantes = await Partido.findAll({
      where: {
        tipo_partido: {
          [Op.ne]: tipo_partido_participado,
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
              // @ts-ignore
              empleado_id: prediccion.empleado_id,
              // @ts-ignore
              partido_id: partido.partido_id,
            },
          });

          if (!prediccion_faltante) {
            t = await conn.transaction();

            const [prediccionFaltante, created] =
              await Predicciones.findOrCreate({
                where: {
                  // @ts-ignore
                  empleado_id: prediccion.empleado_id,
                  // @ts-ignore
                  partido_id: partido.partido_id,
                },
                defaults: {
                  // @ts-ignore
                  empleado_id: prediccion.empleado_id,
                  // @ts-ignore
                  partido_id: partido.partido_id,
                },
                transaction: t,
              });

            if (created) {
              predicciones_creadas++;
            }

            await t.commit();
          }
        }

        console.log(
          `${fechaHoraActual()} - Se crearon ${predicciones_creadas} predicciones para el empleado ID: ${
            // @ts-ignore
            prediccion.empleado_id
          }`
        );
      }
    }
    console.log(
      `${fechaHoraActual()} - Finalizó el proceso de predicciones faltantes`
    );
  } catch (error) {
    // @ts-ignore
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
