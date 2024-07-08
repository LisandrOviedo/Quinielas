/**
 * <b>Funciones relacionadas a los empleados</b>
 * @module "src/controllers/empleados_controllers.js"
 */

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

/**
 * <b>Función para cargar los empleados desde la API</b>
 */
const cargarEmpleados = async () => {
  let t;

  try {
    const rolEmpleado = await Roles.findOne({
      where: {
        nombre: "empleado",
      },
    });

    // @ts-ignore
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
                // @ts-ignore
                rol_id: rolEmpleado.rol_id,
                // @ts-ignore
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
                // @ts-ignore
                rol_id: rolEmpleado.rol_id,
                // @ts-ignore
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
    // @ts-ignore
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error(`Error al crear los empleados: ${error.message}`);
  }
};

/**
 * <b>Función para cargar los empleados faltantes desde un arreglo</b>
 */
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
              // @ts-ignore
              rol_id: rolEmpleado.rol_id,
              // @ts-ignore
              empresa_id: empresa.empresa_id,
              codigo_empleado: empleado_faltante.codigo_empleado,
              cedula: empleado_faltante.cedula,
              clave: empleado_faltante.clave,
              nombres: empleado_faltante.nombres,
              apellidos: empleado_faltante.apellidos,
              fecha_nacimiento: empleado_faltante.fecha_nacimiento,
              // @ts-ignore
              direccion: empleado_faltante.direccion || null,
            },
            { transaction: t }
          );

          await t.commit();
        }
      }
    }
  } catch (error) {
    // @ts-ignore
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error(`Error al crear los empleados faltantes: ${error.message}`);
  }
};

/**
 * <b>Función para cargar empleados faltantes desde un archivo Excel dentro de la carpeta /src/utils</b>
 * @param {string} nombre_excel_con_extension Nombre del archivo Excel con su extensión
 * @param {number} columna_desde Número de columna a empezar a leer
 * @param {number} columna_hasta Número de columna a terminar de leer
 */
const cargarEmpleadosExcel = async (
  nombre_excel_con_extension,
  columna_desde,
  columna_hasta
) => {
  let t;

  try {
    const excelPath = path.join(
      __dirname,
      `../../src/utils/${nombre_excel_con_extension}`
    );

    const workbook = await XlsxPopulate.fromFileAsync(excelPath);

    const worksheet = workbook.sheet(0);

    console.log(`${fechaHoraActual()} - Inició el proceso`);

    let conteo = 0;

    //
    for (let row = columna_desde; row <= columna_hasta; row++) {
      // VERIFICAR EN QUÉ FILA ESTÁ EL NOMBRE, APELLIDO Y CÉDULA Y REEMPLAZAR

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
    // @ts-ignore
    if (t && !t.finished) {
      await t.rollback();
    }

    throw new Error(`Error al crear los empleados del excel: ${error.message}`);
  }
};

/**
 * <b>Función para generar reporte de tabla de posiciones general de una base de datos</b>
 * @param {boolean} ficticios true = Reporte con ficticios | false = Reporte sin ficticios
 * @param {number} limite Límite máximo de posiciones (0 = Todas)
 */
const tablaPosicionesClaros = async (ficticios, limite) => {
  const excelPath = path.join(
    __dirname,
    "../../src/utils/Tabla Posiciones Claros Plantilla.xlsx"
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
            // @ts-ignore
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
              !ficticios &&
              // @ts-ignore
              prediccion.Empleado.direccion === "04127777777"
            ) {
              continue;
            }

            await calcularPuntos(prediccion, resultado).then((objeto) => {
              const index = resultados.findIndex(
                (empleado) => empleado.usuario_id === objeto.usuario_id
              );

              if (index !== -1) {
                // Actualizar el valor
                resultados[index].puntaje =
                  resultados[index].puntaje + objeto.puntaje;
              } else {
                // Agregar un nuevo objeto
                resultados.push(objeto);
              }
            });
          }
        } else {
          console.log(
            `${fechaHoraActual()} - No hay predicciones para el partido:`,
            // @ts-ignore
            resultado.partido_id
          );
        }
      }

      if (resultados.length) {
        resultados.sort((a, b) => b.puntaje - a.puntaje);

        crearCarpetaSiNoExiste(destPath);

        const workbook = await XlsxPopulate.fromFileAsync(excelPath);

        const worksheet = workbook.sheet(0);

        let row = 2;
        let posicion = 1;

        for (const resultado of resultados) {
          if (posicion > limite && limite !== 0) {
            break;
          }

          worksheet.cell(`A${row}`).value(posicion);
          worksheet.cell(`B${row}`).value(resultado.nombres);
          worksheet.cell(`C${row}`).value(resultado.apellidos);
          worksheet.cell(`D${row}`).value(resultado.puntaje);

          row++;
          posicion++;
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
      }
    } else {
      console.log(
        `${fechaHoraActual()} - No hay resultados registrados de partidos`
      );
    }
  } catch (error) {
    throw new Error(`Error al crear el reporte excel: ${error.message}`);
  }
};

/**
 * <b>Función para generar reporte de tabla de posiciones de una quiniela de la Copa América LAMAR</b>
 * @param {number} quiniela_id ID de la quiniela a generar el reporte
 * @param {number} limite Límite máximo de posiciones (0 = Todas)
 */
const tablaPosicionesLAMAR = async (quiniela_id, limite) => {
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
    "../../src/utils/Tabla Posiciones LAMAR Plantilla.xlsx"
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
            // @ts-ignore
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
                  attributes: ["empresa_id", "quiniela_id", "nombre"],
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
              const index = resultados.findIndex(
                (empleado) => empleado.usuario_id === objeto.usuario_id
              );

              if (index !== -1) {
                // Actualizar el valor
                resultados[index].puntaje =
                  resultados[index].puntaje + objeto.puntaje;
              } else {
                // Agregar un nuevo objeto
                resultados.push(objeto);
              }
            });
          }
        } else {
          console.log(
            `${fechaHoraActual()} - No hay predicciones para el partido:`,
            // @ts-ignore
            resultado.partido_id
          );
        }
      }

      if (resultados.length) {
        resultados.sort((a, b) => b.puntaje - a.puntaje);

        crearCarpetaSiNoExiste(destPath);

        const workbook = await XlsxPopulate.fromFileAsync(excelPath);

        const worksheet = workbook.sheet(0);

        let row = 2;
        let posicion = 1;

        for (const resultado of resultados) {
          if (posicion > limite && limite !== 0) {
            break;
          }

          worksheet.cell(`A${row}`).value(posicion);
          worksheet.cell(`B${row}`).value(resultado.nombres);
          worksheet.cell(`C${row}`).value(resultado.apellidos);
          worksheet.cell(`D${row}`).value(resultado.empresa);
          worksheet.cell(`E${row}`).value(resultado.puntaje);

          row++;
          posicion++;
        }

        // @ts-ignore
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
    throw new Error(`Error al crear el reporte excel: ${error.message}`);
  }
};

module.exports = {
  cargarEmpleados,
  cargarEmpleadosFaltantes,
  cargarEmpleadosExcel,
  tablaPosicionesClaros,
  tablaPosicionesLAMAR,
};
