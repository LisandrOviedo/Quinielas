const { conn, Equipo } = require("../db");

const { equipos } = require("../utils/equipos");

const cargarEquipos = async () => {
  let t;

  try {
    for (const equipo of equipos) {
      t = await conn.transaction();

      const [crearEquipo, created] = await Equipo.findOrCreate({
        where: { nombre: equipo },
        defaults: {
          nombre: equipo,
        },
        transaction: t,
      });

      await t.commit();
    }
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error("Error al crear los equipos: " + error.message);
  }
};

module.exports = {
  cargarEquipos,
};
