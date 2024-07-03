const { conn, Quiniela } = require("../db");

const { quinielas } = require("../utils/quinielas");

const { fechaHoraActual } = require("../utils/formatearFecha");

const cargarQuinielas = async () => {
  let t;

  try {
    for (const quiniela of quinielas) {
      t = await conn.transaction();

      const [crearQuiniela, created] = await Quiniela.findOrCreate({
        where: { nombre: quiniela },
        defaults: {
          nombre: quiniela,
        },
        transaction: t,
      });

      await t.commit();
    }
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error(`Error al crear las quinielas: ${error.message}`);
  }
};

module.exports = {
  cargarQuinielas,
};
