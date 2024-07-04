/**
 * <b>Roles de la aplicación web</b>
 * @module "src/utils/roles.js"
 */

/**
 * <b>Lista de roles</b>
 * @type {Array<{nombre: string, descripcion: string}>}
 */
const roles = [
  {
    nombre: "admin",
    descripcion: "Administrador",
  },
  { nombre: "empleado", descripcion: "Empleado" },
];

module.exports = {
  roles,
};
