const axios = require("axios");

const {
  conn,
  Empleado,
  Roles,
  Empresa,
  Predicciones,
  Partido,
  Resultado_Partido,
  Quiniela,
} = require("../db");

const { API_EMPLEADOS } = process.env;

const { YYYYMMDD, fechaHoraActual } = require("../utils/formatearFecha");
const {
  ordenarNombresAPI,
  ordenarDireccionesAPI,
} = require("../utils/formatearTexto");

const {
  crearCarpetaSiNoExiste,
  calcularPuntos,
} = require("../utils/tablaPosiciones");

const { empleados_faltantes } = require("../utils/empleados");

const XlsxPopulate = require("xlsx-populate");
const path = require("path");

const cargarEmpleados = async () => {
  let t;

  try {
    const rolEmpleado = await Roles.findOne({
      where: {
        nombre: "empleado",
      },
    });

    const { data } = await axios(API_EMPLEADOS);

    console.log(`${fechaHoraActual()} - Hizo la consulta de empleados`);

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

    console.log(`${fechaHoraActual()} - Terminó de registrar los empleados`);
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error(
      `${fechaHoraActual()} - Error al crear los empleados:`,
      error.message
    );
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

    throw new Error(
      `${fechaHoraActual()} - Error al crear los empleados faltantes:`,
      error.message
    );
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

    console.log(`${fechaHoraActual()} - Inició el proceso`);

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
                goles_equipo_a: 1,
                goles_equipo_b: 2,
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

        console.log(
          `${fechaHoraActual()} - Se crearon las predicciones de`,
          empleado.cedula
        );
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

          console.log(
            `${fechaHoraActual()} - Se actualizó el partido 1 de`,
            empleado.cedula
          );
        }

        if (
          prediccion2 &&
          (prediccion2.goles_equipo_a === null ||
            prediccion2.goles_equipo_b === null)
        ) {
          t = await conn.transaction();

          await Predicciones.update(
            {
              goles_equipo_a: 1,
              goles_equipo_b: 2,
            },
            {
              where: { empleado_id: empleado.empleado_id, partido_id: 2 },
            },
            { transaction: t }
          );

          await t.commit();

          console.log(
            `${fechaHoraActual()} - Se actualizó el partido 2 de`,
            empleado.cedula
          );
        }
      }
    }

    console.log(`${fechaHoraActual()} - Ya terminó el proceso`);
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error(
      `${fechaHoraActual()} - Error al actualizar la predicción 1 y/o 2:`,
      error.message
    );
  }
};

const cargarEmpleadosExcel = async () => {
  let t;

  try {
    const excelPath = path.join(
      __dirname,
      "../../src/utils/PERSONAL-AQUALAGO.xlsx"
    );

    const workbook = await XlsxPopulate.fromFileAsync(excelPath);

    const worksheet = workbook.sheet(0);

    console.log(`${fechaHoraActual()} - Inició el proceso`);

    let conteo = 0;

    for (let row = 9; row <= 80; row++) {
      // const nombrecompleto = worksheet.cell(`B${row}`).value();
      const nombre = worksheet.cell(`C${row}`).value();
      const apellido = worksheet.cell(`D${row}`).value();
      const cedula = worksheet.cell(`B${row}`).value();

      t = await conn.transaction();

      const [crearEmpleado, created] = await Empleado.findOrCreate({
        where: {
          cedula: cedula,
        },
        defaults: {
          rol_id: 2,
          empresa_id: 56,
          cedula: cedula,
          clave: cedula,
          nombres: ordenarNombresAPI(nombre),
          apellidos: ordenarNombresAPI(apellido),
        },
        transaction: t,
      });

      if (!created) {
        console.log(`${fechaHoraActual()} - Ya existe:`, cedula);
        conteo++;
      }

      await t.commit();
    }

    console.log(
      `${fechaHoraActual()} - Ya terminó el proceso, ya existentes:`,
      conteo
    );
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error(
      `${fechaHoraActual()} - Error al crear los empleados del excel:`,
      error.message
    );
  }
};

const tablaPosicionesClaros = async (ficticios) => {
  const excelPath = path.join(
    __dirname,
    "../../src/utils/Tabla Posiciones Plantilla.xlsx"
  );

  const destPath = path.join(__dirname, `../../src/utils/reportes`);

  try {
    const resultado_partido = await Partido.findAll({
      include: [
        {
          model: Resultado_Partido,
          required: true,
        },
      ],
    });

    if (resultado_partido) {
      let resultados = [];

      for (const resultado of resultado_partido) {
        let predicciones = await Predicciones.findAll({
          where: {
            partido_id: resultado.partido_id,
          },
          include: [
            {
              model: Empleado,
              attributes: [
                "empleado_id",
                "cedula",
                "nombres",
                "apellidos",
                "direccion",
                "codigo_empleado",
                "activo",
              ],
            },
          ],
        });

        if (predicciones) {
          for (const prediccion of predicciones) {
            if (
              (!ficticios && prediccion.Empleado.direccion === "04127777777") ||
              prediccion.Empleado.cedula === "21544607"
            ) {
              continue;
            }

            await calcularPuntos(prediccion, resultado).then((objeto) => {
              let existe = false;

              for (const empleado of resultados) {
                if (empleado.usuario_id === objeto.usuario_id) {
                  empleado.puntaje = empleado.puntaje + objeto.puntaje;
                  existe = true;
                  break;
                }
              }

              if (existe === false) {
                resultados.push(objeto);
              }
            });
          }
        } else {
          console.log(
            `${fechaHoraActual()} - No hay predicciones para el partido:`,
            partido_id
          );
        }
      }

      resultados.sort((a, b) => {
        // Comparar primero por el puntaje de manera descendente
        if (b.puntaje !== a.puntaje) {
          return b.puntaje - a.puntaje;
        }
        // Si el puntaje es igual, comparar por la fecha de manera ascendente
        else {
          return a.fecha_prediccion - b.fecha_prediccion;
        }
      });

      crearCarpetaSiNoExiste(destPath);

      const workbook = await XlsxPopulate.fromFileAsync(excelPath);

      const worksheet = workbook.sheet(0);

      let row = 2;

      for (const resultado of resultados) {
        worksheet.cell(`A${row}`).value(resultado.usuario_id);
        worksheet.cell(`B${row}`).value(resultado.nombres);
        worksheet.cell(`C${row}`).value(resultado.apellidos);
        worksheet.cell(`D${row}`).value(resultado.puntaje);

        row++;
      }

      let nombre_reporte = "";

      if (!ficticios) {
        nombre_reporte = "Tabla Posiciones Claros (Sin Ficticios)";
      } else {
        nombre_reporte = "Tabla Posiciones Claros";
      }

      workbook.toFileAsync(`${destPath}/${nombre_reporte}.xlsx`);

      console.log(
        `${fechaHoraActual()} - Reporte: "${nombre_reporte}" creado exitosamente!`
      );
    } else {
      console.log(
        `${fechaHoraActual()} - No hay resultados registrados de partidos`
      );
    }
  } catch (error) {
    throw new Error(
      `${fechaHoraActual()} - Error al crear el reporte excel:`,
      error.message
    );
  }
};

const tablaPosicionesLAMAR = async (quiniela_id) => {
  if (!quiniela_id) {
    return console.log(`${fechaHoraActual()} - Debes ingresar el quiniela_id`);
  }

  const quiniela = await Quiniela.findOne({
    where: {
      quiniela_id: quiniela_id,
    },
  });

  if (!quiniela) {
    return console.log(`${fechaHoraActual()} - No existe esa quiniela`);
  }

  const excelPath = path.join(
    __dirname,
    "../../src/utils/Tabla Posiciones Plantilla.xlsx"
  );

  const destPath = path.join(__dirname, `../../src/utils/reportes`);

  try {
    const resultado_partido = await Partido.findAll({
      include: [
        {
          model: Resultado_Partido,
          required: true,
        },
      ],
    });

    if (resultado_partido) {
      let resultados = [];

      for (const resultado of resultado_partido) {
        let predicciones = await Predicciones.findAll({
          where: {
            partido_id: resultado.partido_id,
          },
          include: [
            {
              model: Empleado,
              attributes: [
                "empleado_id",
                "empresa_id",
                "cedula",
                "nombres",
                "apellidos",
                "direccion",
                "codigo_empleado",
                "activo",
              ],
              include: [
                {
                  model: Empresa,
                  attributes: ["empresa_id", "quiniela_id"],
                  where: { quiniela_id: quiniela_id },
                  required: true,
                },
              ],
              required: true,
            },
          ],
        });

        if (predicciones) {
          for (const prediccion of predicciones) {
            await calcularPuntos(prediccion, resultado).then((objeto) => {
              let existe = false;

              for (const empleado of resultados) {
                if (empleado.usuario_id === objeto.usuario_id) {
                  empleado.puntaje = empleado.puntaje + objeto.puntaje;
                  existe = true;
                  break;
                }
              }

              if (existe === false) {
                resultados.push(objeto);
              }
            });
          }
        } else {
          console.log(
            `${fechaHoraActual()} - No hay predicciones para el partido:`,
            resultado.partido_id
          );
        }
      }

      if (resultados.length) {
        resultados.sort((a, b) => {
          // Comparar primero por el puntaje de manera descendente
          if (b.puntaje !== a.puntaje) {
            return b.puntaje - a.puntaje;
          }
          // Si el puntaje es igual, comparar por la fecha de manera ascendente
          else {
            return a.fecha_prediccion - b.fecha_prediccion;
          }
        });

        crearCarpetaSiNoExiste(destPath);

        const workbook = await XlsxPopulate.fromFileAsync(excelPath);

        const worksheet = workbook.sheet(0);

        let row = 2;

        for (const resultado of resultados) {
          worksheet.cell(`A${row}`).value(resultado.usuario_id);
          worksheet.cell(`B${row}`).value(resultado.nombres);
          worksheet.cell(`C${row}`).value(resultado.apellidos);
          worksheet.cell(`D${row}`).value(resultado.puntaje);

          row++;
        }

        const nombre_reporte = `Tabla Posiciones LAMAR (${quiniela.nombre})`;

        workbook.toFileAsync(`${destPath}/${nombre_reporte}.xlsx`);

        console.log(
          `${fechaHoraActual()} - Reporte: "${nombre_reporte}" creado exitosamente!`
        );
      }
    } else {
      console.log(
        `${fechaHoraActual()} - No hay resultados registrados de partidos`
      );
    }
  } catch (error) {
    throw new Error(
      `${fechaHoraActual()} - Error al crear el reporte excel:`,
      error.message
    );
  }
};

module.exports = {
  cargarEmpleados,
  cargarEmpleadosFaltantes,
  prediccion1y2,
  cargarEmpleadosExcel,
  tablaPosicionesClaros,
  tablaPosicionesLAMAR,
};
