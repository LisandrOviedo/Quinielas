const axios = require("axios");

const { conn, Empleado, Roles, Empresa } = require("../db");

const { API_EMPLEADOS } = process.env;

const { YYYYMMDD } = require("../utils/formatearFecha");
const {
  ordenarNombresAPI,
  ordenarDireccionesAPI,
} = require("../utils/formatearTexto");

const bcrypt = require("bcrypt");

const traerEmpleado = async (empleado_id) => {
  if (!empleado_id) {
    throw new Error("Datos faltantes");
  }

  try {
    const empleado = await Empleado.findByPk(empleado_id, {
      attributes: {
        exclude: ["rol_id", "clave"],
      },
      include: [
        {
          model: Roles,
          attributes: ["nombre", "descripcion"],
        },
        {
          model: Empresa,
          attributes: ["nombre"],
        },
      ],
    });

    if (!empleado) {
      throw new Error("No existe ese empleado");
    }

    return empleado;
  } catch (error) {
    throw new Error("Error al traer el empleado: " + error.message);
  }
};

const login = async (cedula, clave) => {
  if (!cedula || !clave) {
    throw new Error("Datos faltantes");
  }

  try {
    const empleado = await Empleado.findOne({
      attributes: {
        exclude: ["rol_id"],
      },
      where: { cedula: cedula },
      include: [
        {
          model: Roles,
          attributes: ["rol_id", "nombre"],
        },
      ],
    });

    if (!empleado) {
      throw new Error("Datos incorrectos");
    }

    if (!empleado.activo) {
      throw new Error(
        "Tienes el acceso restringido, ya que tu usuario se encuentra inactivo"
      );
    }

    const claveCoincide = await bcrypt.compare(clave, empleado.clave);

    if (!claveCoincide) {
      throw new Error("Datos incorrectos");
    }

    return await traerEmpleado(empleado.empleado_id);
  } catch (error) {
    throw new Error("Error al loguear: " + error.message);
  }
};

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
      if (empleadoAPI.estado_nomina === "Activo") {
        let empleado = await Empleado.findOne({
          where: {
            cedula: empleadoAPI.cedula,
          },
        });

        if (!empleado) {
          if (empleadoAPI.codigo_tipo_nomina === "N8") {
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
                  direccion:
                    ordenarDireccionesAPI(empleadoAPI.direccion) || null,
                },
                { transaction: t }
              );

              await t.commit();
            }
          } else if (
            empleadoAPI.codigo_tipo_nomina === "104" ||
            empleadoAPI.codigo_tipo_nomina === "112"
          ) {
            let empresa_byb = await Empresa.findOne({
              where: {
                nombre: "BYB",
              },
            });

            if (empresa_byb) {
              t = await conn.transaction();

              await Empleado.create(
                {
                  rol_id: rolEmpleado.rol_id,
                  empresa_id: empresa_byb.empresa_id,
                  codigo_empleado: empleadoAPI.codigo_empleado,
                  cedula: empleadoAPI.cedula,
                  clave: empleadoAPI.cedula,
                  nombres: ordenarNombresAPI(empleadoAPI.nombres),
                  apellidos: ordenarNombresAPI(empleadoAPI.apellidos),
                  fecha_nacimiento: `${YYYYMMDD(empleadoAPI.fecha_nacimiento)}`,
                  direccion:
                    ordenarDireccionesAPI(empleadoAPI.direccion) || null,
                },
                { transaction: t }
              );

              await t.commit();
            }
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
                  direccion:
                    ordenarDireccionesAPI(empleadoAPI.direccion) || null,
                },
                { transaction: t }
              );

              await t.commit();
            }
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

module.exports = {
  traerEmpleado,
  login,
  cargarEmpleados,
};
