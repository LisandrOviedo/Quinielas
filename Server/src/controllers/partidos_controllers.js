const { conn, Partido, Torneo, Equipo, Predicciones } = require("../db");

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
    const partidos_activos = await Partido.findAll({
      where: {
        activo: 1,
      },
    });

    if (partidos_activos) {
      const fecha_actual = new Date();

      let t;

      for (const partido of partidos_activos) {
        const fecha_hora_partido = partido.fecha_hora_partido;

        const diferencia = Math.abs(fecha_actual - fecha_hora_partido) / 1000; // Diferencia en segundos

        if (fecha_actual >= fecha_hora_partido || diferencia <= 300) {
          t = await conn.transaction();

          await Partido.update(
            {
              activo: 0,
            },
            {
              where: { partido_id: partido.partido_id },
            },
            { transaction: t }
          );

          await t.commit();

          console.log(
            `Partido ${partido.partido_id} cerrado, ya que su fecha y hora es:`,
            fecha_hora_partido.toLocaleString()
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
