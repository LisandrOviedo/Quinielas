const axios = require("axios");

const { conn, Empresa, Quiniela } = require("../db");

const { API_EMPLEADOS } = process.env;

const { empresas_faltantes } = require("../utils/empresas");

const {
  ordenarNombresAPI,
  ordenarDireccionesAPI,
} = require("../utils/formatearTexto");

const { fechaHoraActual } = require("../utils/formatearFecha");

const cargarEmpresas = async () => {
  let t;

  try {
    const { data } = await axios(API_EMPLEADOS);

    console.log(`${fechaHoraActual()} - Hizo la consulta de empresas`);

    for (const empresaAPI of data) {
      if (
        empresaAPI.descripcion_empresa
          .toLowerCase()
          .includes("aquatic feeds aquafica") ||
        empresaAPI.descripcion_empresa.toLowerCase().includes("pesca atlantico")
      ) {
        continue;
      }

      let empresa = await Empresa.findOne({
        where: {
          codigo_empresa: empresaAPI.codigo_empresa,
        },
      });

      if (!empresa) {
        let quiniela = null;

        if (
          empresaAPI.descripcion_empresa.toLowerCase().includes("b & b") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("corporativo") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("reco reciclajes ecologicos") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("transporte de alimentos") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("ingenieria") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("distribuidora lago maracaibo") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("los soles restaurant") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("operadora industrial del lago") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("la casa del acuicultor") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("aduana") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("inversiones negr") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("balanceado") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("harinera del mar caribe") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("altamar") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("doña clara") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("transalca") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("lcda") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("imdaca") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("harimarca") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("opindulca") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("industria marina de alimentos")
        ) {
          quiniela = "Maracaibo";
        } else if (
          empresaAPI.descripcion_empresa.toLowerCase().includes("lamarsa") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("ecolarva") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("faraven") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("grucasa") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("farallon") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("catabre") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("laboratorio marino") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("agromarina costa azul") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("laboratorio ocean marine") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("agropecuaria makaer") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("palmeras lago maracaibo") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("acuicola puerto caleta") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("aserradero san andres") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("ganaderia del lago") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("agricola los claros") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("inversiones marinas c.a.")
        ) {
          quiniela = "Falcón - Machiques";
        } else if (
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("inversiones marinas del lago") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("centro investigativo marino") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("inmarlaca")
        ) {
          quiniela = "Inmarlaca";
        } else if (
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("procesadora atlantico c.a")
        ) {
          quiniela = "Atlántico";
        } else if (
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("agropecuaria don ramon") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("inversiones piscicolas la cima") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("agrodirecto") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("agropecuaria nava serrada") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("mayollera") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("matapalo")
        ) {
          quiniela = "Occidente";
        } else if (
          empresaAPI.descripcion_empresa.toLowerCase().includes("aquazul") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("moporo") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("astrea") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("feltrina") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("tomoporo") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("ceuta") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("camelias") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("arapuey") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("don saul") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("aquadoca") ||
          empresaAPI.descripcion_empresa.toLowerCase().includes("bogotana") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("camaronera de la costa occidental") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("acuatecnica de venezuela") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("aquacultivos de occidente") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("camaronera costa lago") ||
          empresaAPI.descripcion_empresa
            .toLowerCase()
            .includes("acuicultivo coquivacoa")
        ) {
          quiniela = "Sur Del Lago";
        } else if (
          empresaAPI.descripcion_empresa.toLowerCase().includes("antartica")
        ) {
          quiniela = "Antártica";
        }

        let asignar_quiniela = await Quiniela.findOne({
          where: {
            nombre: quiniela,
          },
        });

        t = await conn.transaction();

        await Empresa.create(
          {
            quiniela_id:
              quiniela !== null ? asignar_quiniela.quiniela_id : null,
            codigo_empresa: empresaAPI.codigo_empresa,
            nombre: ordenarNombresAPI(empresaAPI.descripcion_empresa),
            direccion: ordenarDireccionesAPI(empresaAPI.direccion_empresa),
            rif: empresaAPI.rif_empresa,
          },
          { transaction: t }
        );

        await t.commit();
      }
    }

    for (const empresa_faltante of empresas_faltantes) {
      let empresa = await Empresa.findOne({
        where: {
          nombre: empresa_faltante.nombre,
        },
      });

      if (!empresa) {
        const quiniela_faltante = await Quiniela.findOne({
          where: {
            nombre: empresa_faltante.quiniela,
          },
        });

        if (quiniela_faltante) {
          t = await conn.transaction();

          await Empresa.create(
            {
              quiniela_id: quiniela_faltante.quiniela_id,
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
    }

    console.log(`${fechaHoraActual()} - Terminó de registrar las empresas`);
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error(
      `Error al crear las empresas: ${error.message}`
    );
  }
};

module.exports = {
  cargarEmpresas,
};
