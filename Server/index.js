require("dotenv").config();

const server = require("./src/server.js");
const { conn } = require("./src/db.js");
const PORT = process.env.PORT_SERVER || 3001;

// const { cargarRoles } = require("./src/controllers/roles_controllers.js");
// const { cargarEmpresas } = require("./src/controllers/empresas_controllers.js");
// const {
//   cargarEmpleados,
// } = require("./src/controllers/empleados_controllers.js");
// const { cargarEquipos } = require("./src/controllers/equipos_controllers.js");
// const { cargarTorneos } = require("./src/controllers/torneos_controllers.js");
// const { cargarTorneos } = require("./src/controllers/torneos_controllers.js");
// const { cargarPartidos } = require("./src/controllers/partidos_controllers.js");

conn
  .sync({ alter: true })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);

      // cargarRoles();

      // cargarEmpresas().then(() => {
      // cargarEmpleados();
      // });

      // cargarEquipos();
      // cargarTorneos();
      // cargarPartidos();
    });
  })
  .catch((error) => console.error(error));
