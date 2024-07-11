/**
 * <b>Archivo raiz para la inicialización del servidor</b>
 * @module "index.js"
 */

require("dotenv").config();

const server = require("./src/server.js");

const { conn, conn3, conn4 } = require("./src/db.js");

/**
 * <b>Puerto que usará el servidor al iniciar</b>
 * @type {(string|number)}
 */
const PORT = process.env.PORT_SERVER || 4055;

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

      // const hora_actual = new Date().getHours();

      try {
        // await cargarRoles();
        //
        // await cargarQuinielas();
        //
        // await cargarEmpresas();
        //
        // await cargarEmpleados();
        //
        // await cargarEmpleadosFaltantes();
        //
        // await cargarEquipos();
        //
        // await cargarTorneos();
        //
        // await cargarPartidos();
        //
        // await cargarEmpleadosExcel("Empleados-Aqualago.xlsx", 9, 80);
        //
        // if (hora_actual === 9) {
        //   await tablaPosicionesClaros(conn3, true, 0, [
        //     "rlaguna@grupo-lamar.com",
        //     "aseco@grupo-lamar.com",
        //   ]);
        //
        //   await tablaPosicionesClaros(conn4, true, 0, [
        //     "rlaguna@grupo-lamar.com",
        //     "aseco@grupo-lamar.com",
        //   ]);
        // }
        //
        // await tablaPosicionesLAMAR(5, 0, [
        //   "rlaguna@grupo-lamar.com",
        //   "aseco@grupo-lamar.com",
        // ]);
        //
        // await prediccionesFaltantes(24, "Fase de grupos");
        //
        // await cerrarPartidos();
      } catch (err) {
        console.error("Error:", err);
        process.exit(1); // Salir con código de error 1 en caso de error
      } finally {
        process.exit(0); // Salir con código de éxito 0 al final
      }
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
