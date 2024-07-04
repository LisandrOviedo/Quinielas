/**
 * <b>Funciones relacionadas a las quinielas</b>
 * @module "src/controllers/quinielas_controllers.js"
 */

const { conn, Quiniela } = require("../db");

const { quinielas } = require("../utils/quinielas");

/**
 * <b>Función para cargar las quinielas desde un arreglo</b>
 */
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
    // @ts-ignore
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error(`Error al crear las quinielas: ${error.message}`);
  }
};

module.exports = {
  cargarQuinielas,
};
