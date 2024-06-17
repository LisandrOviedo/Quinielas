const express = require("express");
const router = require("./routes/index");
const morgan = require("morgan");
const cors = require("cors");

const server = express();

server.use(cors());
server.use(morgan("dev"));
server.use(express.json({ limit: "65mb" })); //Límite máximo en el tamaño de los datos JSON que el servidor puede manejar de una sola vez, para evitar posibles ataques de denegación de servicio (DoS) o abusos.

server.use(router);

module.exports = server;
