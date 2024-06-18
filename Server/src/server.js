const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const server = express();

server.use(cors());
server.use(morgan("dev"));
server.use(express.json({ limit: "65mb" })); //Límite máximo en el tamaño de los datos JSON que el servidor puede manejar de una sola vez, para evitar posibles ataques de denegación de servicio (DoS) o abusos.

module.exports = server;
