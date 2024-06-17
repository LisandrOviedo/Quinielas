const axios = require("axios");

const { conn, Empresa } = require("../db");

const { API_EMPLEADOS } = process.env;

const {
  ordenarNombresAPI,
  ordenarDireccionesAPI,
} = require("../utils/formatearTexto");

const cargarEmpresas = async () => {
  let t;

  try {
    const { data } = await axios(API_EMPLEADOS);

    console.log("hizo la consulta de empresas", new Date());

    for (const empresaAPI of data) {
      if (empresaAPI.estado_nomina === "Activo") {
        let empresa = await Empresa.findOne({
          where: {
            codigo_empresa: empresaAPI.codigo_empresa,
          },
        });

        if (!empresa) {
          t = await conn.transaction();

          await Empresa.create(
            {
              codigo_empresa: empresaAPI.codigo_empresa.trim(),
              nombre: ordenarNombresAPI(empresaAPI.descripcion_empresa),
              direccion: ordenarDireccionesAPI(empresaAPI.direccion_empresa),
              rif: empresaAPI.rif_empresa.trim(),
            },
            { transaction: t }
          );

          await t.commit();
        }
      }
    }

    console.log("terminó de registrar las empresas", new Date());
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error("Error al crear las empresas: " + error.message);
  }
};

module.exports = {
  cargarEmpresas,
};
