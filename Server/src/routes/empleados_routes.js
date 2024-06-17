const { Router } = require("express");
const { getLogin } = require("../handlers/empleados_handlers");

const empleados = Router();

empleados.get("/login", getLogin);

module.exports = empleados;
