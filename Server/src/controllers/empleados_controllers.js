const axios = require("axios");

const { conn, Empleado, Roles, Empresa } = require("../db");

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

module.exports = {
  cargarEmpleados,
  cargarEmpleadosFaltantes,
};
