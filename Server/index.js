/**
 * <b>Archivo raiz para la inicialización del servidor</b>
 * @module "index.js"
 */

require("dotenv").config();

const server = require("./src/server.js");

const { conn } = require("./src/db.js");

/**
 * <b>Puerto que usará el servidor al iniciar</b>
 * @type {(string|number)}
 */
const PORT = process.env.PORT_SERVER || 3001;

const { fechaHoraActual } = require("./src/utils/formatearFecha.js");

const { cargarRoles } = require("./src/controllers/roles_controllers.js");
const { cargarEmpresas } = require("./src/controllers/empresas_controllers.js");
const {
  cargarEmpleados,
  cargarEmpleadosFaltantes,
  cargarEmpleadosExcel,
  tablaPosicionesClaros,
  tablaPosicionesLAMAR,
} = require("./src/controllers/empleados_controllers.js");
const { cargarEquipos } = require("./src/controllers/equipos_controllers.js");
const { cargarTorneos } = require("./src/controllers/torneos_controllers.js");
const {
  cargarPartidos,
  cerrarPartidos,
  prediccionesFaltantes,
} = require("./src/controllers/partidos_controllers.js");
const {
  cargarQuinielas,
} = require("./src/controllers/quinielas_controllers.js");

conn
  .sync()
  .then(() => {
    server.listen(PORT, async () => {
      console.log(`${fechaHoraActual()} - Server listening on port ${PORT}`);

      // await cargarRoles();

      // await cargarQuinielas();
      // await cargarEmpresas();
      // await cargarEmpleados();

      // await cargarEmpleadosFaltantes();

      // await cargarEquipos();
      // await cargarTorneos();
      // await cargarPartidos();

      // await cargarEmpleadosExcel("Empleados-Aqualago.xlsx", 9, 80);

      // await tablaPosicionesClaros(true);

      // await tablaPosicionesLAMAR(5);

      // await prediccionesFaltantes(24, "Fase de grupos");

      await cerrarPartidos().then(() => {
        console.log(
          `${fechaHoraActual()} - Terminó el proceso de cerrar partidos`
        );

        process.exit(0);
      });
    });
  })
  .catch((error) => console.error(error));
