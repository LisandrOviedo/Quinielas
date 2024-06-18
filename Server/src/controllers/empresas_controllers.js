const axios = require("axios");

const { conn, Empresa, Quiniela } = require("../db");

const { API_EMPLEADOS } = process.env;

const { empresas_faltantes } = require("../utils/empresas");

const {
  ordenarNombresAPI,
  ordenarDireccionesAPI,
} = require("../utils/formatearTexto");

const cargarEmpresas = async () => {
  let t;

  try {
    const quiniela_maracaibo = await Quiniela.findOne({
      where: {
        nombre: "Maracaibo",
      },
    });

    // const { data } = await axios(API_EMPLEADOS);

    console.log("hizo la consulta de empresas", new Date());

    // for (const empresaAPI of data) {
    //   if (empresaAPI.estado_nomina === "Activo") {
    //     let empresa = await Empresa.findOne({
    //       where: {
    //         codigo_empresa: empresaAPI.codigo_empresa,
    //       },
    //     });

    //     if (!empresa) {
    //       let quiniela = null;

    //       if (
    //         empresaAPI.descripcion_empresa
    //           .toLowerCase()
    //           .includes("balanceado") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("altamar") ||
    //         empresaAPI.descripcion_empresa
    //           .toLowerCase()
    //           .includes("doña clara") ||
    //         empresaAPI.descripcion_empresa
    //           .toLowerCase()
    //           .includes("antartica") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("imdaca") ||
    //         empresaAPI.descripcion_empresa
    //           .toLowerCase()
    //           .includes("harimarca") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("opindulca")
    //       ) {
    //         quiniela = "San Francisco";
    //       } else if (
    //         empresaAPI.descripcion_empresa
    //           .toLowerCase()
    //           .includes("inmarlaca") ||
    //         empresaAPI.descripcion_empresa
    //           .toLowerCase()
    //           .includes("marinas del") ||
    //         empresaAPI.descripcion_empresa
    //           .toLowerCase()
    //           .includes("mayollera") ||
    //         empresaAPI.descripcion_empresa
    //           .toLowerCase()
    //           .includes("agrodirecto") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("atlantico")
    //       ) {
    //         quiniela = "La Cañada";
    //       } else if (
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("aquazul") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("moporo") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("astrea") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("feltrina") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("tomoporo") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("ceuta") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("camelias") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("arapuey") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("don saul") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("aquadoca") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("bogotana")
    //       ) {
    //         quiniela = "Sur Del Lago";
    //       } else if (
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("lamarsa") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("ecolarva") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("faraven") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("grucasa") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("farallon") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("catabre")
    //       ) {
    //         quiniela = "Falcón";
    //       } else if (
    //         empresaAPI.descripcion_empresa
    //           .toLowerCase()
    //           .includes("corporativo") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("aduana") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("lcda") ||
    //         empresaAPI.descripcion_empresa
    //           .toLowerCase()
    //           .includes("transalca") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("ING") ||
    //         empresaAPI.descripcion_empresa.toLowerCase().includes("3030")
    //       ) {
    //         quiniela = "Maracaibo";
    //       }

    //       let asignar_quiniela = await Quiniela.findOne({
    //         where: {
    //           nombre: quiniela,
    //         },
    //       });

    //       t = await conn.transaction();

    //       await Empresa.create(
    //         {
    //           quiniela_id:
    //             quiniela !== null ? asignar_quiniela.quiniela_id : null,
    //           codigo_empresa: empresaAPI.codigo_empresa,
    //           nombre: ordenarNombresAPI(empresaAPI.descripcion_empresa),
    //           direccion: ordenarDireccionesAPI(empresaAPI.direccion_empresa),
    //           rif: empresaAPI.rif_empresa,
    //         },
    //         { transaction: t }
    //       );

    //       await t.commit();
    //     }
    //   }
    // }

    for (const empresa_faltante of empresas_faltantes) {
      let empresa = await Empresa.findOne({
        where: {
          nombre: empresa_faltante.nombre,
        },
      });

      if (!empresa) {
        t = await conn.transaction();

        await Empresa.create(
          {
            quiniela_id: quiniela_maracaibo.quiniela_id,
            codigo_empresa: empresa_faltante.codigo_empresa || null,
            nombre: empresa_faltante.nombre,
            direccion: empresa_faltante.direccion_empresa || null,
            rif: empresa_faltante.rif_empresa || null,
          },
          { transaction: t }
        );

        await t.commit();
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
