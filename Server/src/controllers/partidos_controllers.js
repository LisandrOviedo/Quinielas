const { QueryTypes } = require("sequelize");

const {
  conn,
  conn2,
  conn3,
  Partido,
  Torneo,
  Equipo,
  Predicciones,
} = require("../db");

const { partidos } = require("../utils/partidos");

const { cerrarPartido } = require("../utils/cerrarPartidos");

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
    const partidos_activos = await conn.query(
      "SELECT * FROM partidos WHERE activo = 1",
      {
        type: QueryTypes.SELECT,
      }
    );

    const partidos_activos2 = await conn2.query(
      "SELECT * FROM partidos WHERE activo = 1",
      {
        type: QueryTypes.SELECT,
      }
    );

    const partidos_activos3 = await conn3.query(
      "SELECT * FROM partidos WHERE activo = 1",
      {
        type: QueryTypes.SELECT,
      }
    );

    if (partidos_activos) {
      await cerrarPartido(partidos_activos, conn);
    }

    if (partidos_activos2) {
      await cerrarPartido(partidos_activos2, conn2);
    }

    if (partidos_activos3) {
      await cerrarPartido(partidos_activos3, conn3);
    }
  } catch (error) {
    throw new Error("Error al cerrar los partidos: " + error.message);
  }
};

module.exports = {
  cargarPartidos,
  cerrarPartidos,
};
