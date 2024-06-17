const { Router } = require("express");

const empleados = require("./empleados_routes");

const router = Router();

router.use("/quinielas/empleados", empleados);

module.exports = router;
