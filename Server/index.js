require("dotenv").config();

const server = require("./src/server.js");
const { conn } = require("./src/db.js");
const PORT = process.env.PORT_SERVER || 3001;

const { cargarRoles } = require("./src/controllers/roles_controllers.js");
const { cargarEmpresas } = require("./src/controllers/empresas_controllers.js");
const {
  cargarEmpleados,
  cargarEmpleadosFaltantes,
} = require("./src/controllers/empleados_controllers.js");
const { cargarEquipos } = require("./src/controllers/equipos_controllers.js");
const { cargarTorneos } = require("./src/controllers/torneos_controllers.js");
const { cargarPartidos } = require("./src/controllers/partidos_controllers.js");
const {
  cargarQuinielas,
} = require("./src/controllers/quinielas_controllers.js");

conn
  .sync()
  .then(() => {
    server.listen(PORT, async () => {
      console.log(`Server listening on port ${PORT}`);

      // await cargarRoles();

      // await cargarQuinielas();
      // await cargarEmpresas();
      // await cargarEmpleados();

      // await cargarEmpleadosFaltantes();

      // await cargarEquipos();
      // await cargarTorneos();
      // await cargarPartidos();
    });
  })
  .catch((error) => console.error(error));
