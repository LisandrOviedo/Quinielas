const { conn, Partido, Torneo, Equipo } = require("../db");

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
          fecha_hora_partido: partido.fecha_hora_partido,
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

module.exports = {
    cargarPartidos,
};
