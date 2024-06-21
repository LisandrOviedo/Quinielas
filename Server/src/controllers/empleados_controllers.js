const axios = require("axios");

const {
  conn,
  Empleado,
  Roles,
  Empresa,
  Predicciones,
  Partido,
} = require("../db");

const { API_EMPLEADOS } = process.env;

const { YYYYMMDD } = require("../utils/formatearFecha");
const {
  ordenarNombresAPI,
  ordenarDireccionesAPI,
} = require("../utils/formatearTexto");

const { empleados_faltantes } = require("../utils/empleados");

const cargarEmpleados = async () => {
  let t;

  try {
    const rolEmpleado = await Roles.findOne({
      where: {
        nombre: "empleado",
      },
    });

    const { data } = await axios(API_EMPLEADOS);

    console.log("hizo la consulta de empleados", new Date());

    for (const empleadoAPI of data) {
      let empleado = await Empleado.findOne({
        where: {
          cedula: empleadoAPI.cedula,
        },
      });

      if (!empleado) {
        if (
          empleadoAPI.codigo_tipo_nomina.toUpperCase() === "N8" &&
          empleadoAPI.descripcion_empresa
            .toLowerCase()
            .includes("marinas del lago")
        ) {
          let empresa_corporativo = await Empresa.findOne({
            where: {
              nombre: "Corporativo",
            },
          });

          if (empresa_corporativo) {
            t = await conn.transaction();

            await Empleado.create(
              {
                rol_id: rolEmpleado.rol_id,
                empresa_id: empresa_corporativo.empresa_id,
                codigo_empleado: empleadoAPI.codigo_empleado,
                cedula: empleadoAPI.cedula,
                clave: empleadoAPI.cedula,
                nombres: ordenarNombresAPI(empleadoAPI.nombres),
                apellidos: ordenarNombresAPI(empleadoAPI.apellidos),
                fecha_nacimiento: `${YYYYMMDD(empleadoAPI.fecha_nacimiento)}`,
                direccion: ordenarDireccionesAPI(empleadoAPI.direccion) || null,
              },
              { transaction: t }
            );

            await t.commit();
          }
        } else if (
          empleadoAPI.descripcion_empresa
            .toLowerCase()
            .includes("aquatic feeds aquafica") ||
          empleadoAPI.descripcion_empresa
            .toLowerCase()
            .includes("pesca atlantico")
        ) {
          continue;
        } else {
          let empresa = await Empresa.findOne({
            where: {
              codigo_empresa: empleadoAPI.codigo_empresa,
            },
          });

          if (empresa) {
            t = await conn.transaction();

            await Empleado.create(
              {
                rol_id: rolEmpleado.rol_id,
                empresa_id: empresa.empresa_id,
                codigo_empleado: empleadoAPI.codigo_empleado,
                cedula: empleadoAPI.cedula,
                clave: empleadoAPI.cedula,
                nombres: ordenarNombresAPI(empleadoAPI.nombres),
                apellidos: ordenarNombresAPI(empleadoAPI.apellidos),
                fecha_nacimiento: `${YYYYMMDD(empleadoAPI.fecha_nacimiento)}`,
                direccion: ordenarDireccionesAPI(empleadoAPI.direccion) || null,
              },
              { transaction: t }
            );

            await t.commit();
          }
        }
      }
    }

    console.log("terminó de registrar los empleados", new Date());
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error("Error al crear los empleados: " + error.message);
  }
};

const cargarEmpleadosFaltantes = async () => {
  let t;

  try {
    const rolEmpleado = await Roles.findOne({
      where: {
        nombre: "empleado",
      },
    });

    for (const empleado_faltante of empleados_faltantes) {
      let empleado = await Empleado.findOne({
        where: {
          cedula: empleado_faltante.cedula,
        },
      });

      if (!empleado) {
        let empresa = await Empresa.findOne({
          where: {
            nombre: empleado_faltante.empresa,
          },
        });

        if (empresa) {
          t = await conn.transaction();

          await Empleado.create(
            {
              rol_id: rolEmpleado.rol_id,
              empresa_id: empresa.empresa_id,
              codigo_empleado: empleado_faltante.codigo_empleado,
              cedula: empleado_faltante.cedula,
              clave: empleado_faltante.clave,
              nombres: empleado_faltante.nombres,
              apellidos: empleado_faltante.apellidos,
              fecha_nacimiento: empleado_faltante.fecha_nacimiento,
              direccion: empleado_faltante.direccion || null,
            },
            { transaction: t }
          );

          await t.commit();
        }
      }
    }
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error("Error al crear los empleados faltantes: " + error.message);
  }
};

const prediccion1y2 = async () => {
  let t;

  try {
    const empleados = await Empleado.findAll({
      attributes: ["empleado_id", "cedula"],
    });

    const partidos = await Partido.findAll({
      attributes: ["partido_id"],
    });

    console.log("inició el proceso", new Date());

    for (const empleado of empleados) {
      let prediccion = await Predicciones.findOne({
        attributes: [
          "prediccion_id",
          "empleado_id",
          "partido_id",
          "goles_equipo_a",
          "goles_equipo_b",
        ],
        where: {
          empleado_id: empleado.empleado_id,
          partido_id: 1,
        },
      });

      let prediccion2 = await Predicciones.findOne({
        attributes: [
          "prediccion_id",
          "empleado_id",
          "partido_id",
          "goles_equipo_a",
          "goles_equipo_b",
        ],
        where: {
          empleado_id: empleado.empleado_id,
          partido_id: 2,
        },
      });

      if (!prediccion) {
        for (const partido of partidos) {
          if (partido.partido_id === 1) {
            t = await conn.transaction();

            await Predicciones.findOrCreate({
              where: {
                empleado_id: empleado.empleado_id,
                partido_id: partido.partido_id,
              },
              defaults: {
                empleado_id: empleado.empleado_id,
                partido_id: partido.partido_id,
                goles_equipo_a: 2,
                goles_equipo_b: 0,
              },
              transaction: t,
            });

            await t.commit();
          } else if (partido.partido_id === 2) {
            t = await conn.transaction();

            await Predicciones.findOrCreate({
              where: {
                empleado_id: empleado.empleado_id,
                partido_id: partido.partido_id,
              },
              defaults: {
                empleado_id: empleado.empleado_id,
                partido_id: partido.partido_id,
                goles_equipo_a: 0,
                goles_equipo_b: 1,
              },
              transaction: t,
            });

            await t.commit();
          } else {
            t = await conn.transaction();

            await Predicciones.findOrCreate({
              where: {
                empleado_id: empleado.empleado_id,
                partido_id: partido.partido_id,
              },
              defaults: {
                empleado_id: empleado.empleado_id,
                partido_id: partido.partido_id,
              },
              transaction: t,
            });

            await t.commit();
          }
        }

        console.log("se crearon las predicciones de", empleado.cedula);
      } else {
        if (
          prediccion.goles_equipo_a === null ||
          prediccion.goles_equipo_b === null
        ) {
          t = await conn.transaction();

          await Predicciones.update(
            {
              goles_equipo_a: 2,
              goles_equipo_b: 0,
            },
            {
              where: { empleado_id: empleado.empleado_id, partido_id: 1 },
            },
            { transaction: t }
          );

          await t.commit();

          console.log("se actualizó el partido 1 de", empleado.cedula);
        }

        if (
          prediccion2 &&
          (prediccion2.goles_equipo_a === null ||
            prediccion2.goles_equipo_b === null)
        ) {
          t = await conn.transaction();

          await Predicciones.update(
            {
              goles_equipo_a: 0,
              goles_equipo_b: 1,
            },
            {
              where: { empleado_id: empleado.empleado_id, partido_id: 2 },
            },
            { transaction: t }
          );

          await t.commit();

          console.log("se actualizó el partido 2 de", empleado.cedula);
        }
      }
    }

    console.log("ya terminó el proceso", new Date());
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error(
      "Error al actualizar la predicción 1 y/o 2: " + error.message
    );
  }
};

module.exports = {
  cargarEmpleados,
  cargarEmpleadosFaltantes,
  prediccion1y2,
};
