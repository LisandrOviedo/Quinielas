const { conn, Roles } = require("../db");

const { roles } = require("../utils/roles");

const { fechaHoraActual } = require("../utils/formatearFecha");

const cargarRoles = async () => {
  let t;

  try {
    for (const rol of roles) {
      t = await conn.transaction();

      const [crearRol, created] = await Roles.findOrCreate({
        where: { nombre: rol.nombre, descripcion: rol.descripcion },
        defaults: {
          nombre: rol.nombre,
          descripcion: rol.descripcion,
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
      `Error al crear los roles: ${error.message}`
    );
  }
};

module.exports = {
  cargarRoles,
};
