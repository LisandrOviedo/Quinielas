const { conn, Torneo } = require("../db");

const { torneos } = require("../utils/torneos");

const { fechaHoraActual } = require("../utils/formatearFecha");

const cargarTorneos = async () => {
  let t;

  try {
    for (const torneo of torneos) {
      t = await conn.transaction();

      const [crearTorneo, created] = await Torneo.findOrCreate({
        where: { nombre: torneo.nombre },
        defaults: {
          nombre: torneo.nombre,
          fecha_inicio: torneo.fecha_inicio,
          fecha_fin: torneo.fecha_fin,
        },
        transaction: t,
      });

      await t.commit();
    }
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error(
      `${fechaHoraActual()} - Error al crear los torneos:`,
      error.message
    );
  }
};

module.exports = {
  cargarTorneos,
};
