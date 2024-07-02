const { conn, Equipo } = require("../db");

const { equipos } = require("../utils/equipos");

const { fechaHoraActual } = require("../utils/formatearFecha");

const cargarEquipos = async () => {
  let t;

  try {
    for (const equipo of equipos) {
      t = await conn.transaction();

      const [crearEquipo, created] = await Equipo.findOrCreate({
        where: { nombre: equipo.nombre },
        defaults: {
          nombre: equipo.nombre,
          ruta_imagen: equipo.ruta_imagen,
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
      `Error al crear los equipos: ${error.message}`
    );
  }
};

module.exports = {
  cargarEquipos,
};
