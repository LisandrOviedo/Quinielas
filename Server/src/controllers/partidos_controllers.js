const { conn, Partido, Torneo, Equipo, Resultado_Partido } = require("../db");

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
  const partidos_activos = await Partido.findAll({
    where: {
      activo: 1,
    },
  });

  const fecha_actual = new Date();

  console.log("fecha_a:", fecha_actual);
  
  for (const partido of partidos_activos) {
    const fecha_hora_partido = new Date(
      partido.fecha_hora_partido.getTime() + 4 * 60 * 60 * 1000
    );

    console.log("fecha_b:", fecha_hora_partido);

    const diferencia = Math.abs(fecha_actual - fecha_hora_partido) / 1000; // Diferencia en segundos

    if (fecha_actual >= fecha_hora_partido) {
      console.log("Debió cerrar antes");
    } else if (diferencia <= 300) {
      console.log(
        "La fecha y hora de la base de datos está dentro de un rango de 5 minutos"
      );
    } else {
      console.log("Falta para cerrarlo");
    }
  }
};

module.exports = {
  cargarPartidos,
  cerrarPartidos,
};
