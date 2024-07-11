/**
 * <b>Funciones relacionadas a los empleados</b>
 * @module "src/controllers/empleados_controllers.js"
 */

const { QueryTypes } = require("sequelize");

const axios = require("axios");

const { conn, conn2, Empleado, Roles, Empresa } = require("../db");

const { API_EMPLEADOS, EMAIL, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT } =
  process.env;

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

const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const nodeMailer = require("nodemailer");

const transporter = nodeMailer.createTransport({
  // @ts-ignore
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false,
  auth: {
    user: EMAIL,
    pass: EMAIL_PASS,
  },
});

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
 * @param {*} conn Conexión de base de datos a utilizar
 * @param {boolean} ficticios true = Reporte con ficticios | false = Reporte sin ficticios
 * @param {number} limite Límite máximo de posiciones (0 = Sin límite)
 * @param {Array<string>} correos Lista de direcciones de correos donde se enviará el reporte
 */
const tablaPosicionesClaros = async (conn, ficticios, limite, correos) => {
  if (
    conn.config.database === "quiniela_db_claros" ||
    conn.config.database === "quiniela_db_euro"
  ) {
    try {
      const resultado_partido = await conn.query(
        "SELECT * FROM partidos INNER JOIN resultado_partidos ON partidos.partido_id = resultado_partidos.partido_id",
        {
          type: QueryTypes.SELECT,
        }
      );

      if (resultado_partido) {
        let resultados = [];

        for (const resultado of resultado_partido) {
          const predicciones = await conn.query(
            `SELECT predicciones.*, empleados.empleado_id, empleados.cedula, empleados.nombres, empleados.apellidos, empleados.activo FROM predicciones INNER JOIN empleados ON predicciones.empleado_id = empleados.empleado_id WHERE predicciones.partido_id = ${resultado.partido_id}`,
            {
              type: QueryTypes.SELECT,
            }
          );

          if (predicciones) {
            for (const prediccion of predicciones) {
              if (
                (!ficticios &&
                  // @ts-ignore
                  prediccion.direccion === "04127777777") ||
                prediccion.goles_equipo_a === null ||
                prediccion.goles_equipo_b === null
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

          const destPath = path.join(__dirname, `../../src/utils/reportes`);

          crearCarpetaSiNoExiste(destPath);

          // @ts-ignore
          const doc = new PDFDocument({
            bufferPages: true,
            font: "Helvetica",
          });

          let nombre_quiniela = "";
          let nombre_correo = "";

          if (conn.config.database === "quiniela_db_claros") {
            nombre_quiniela = `Tabla De Posiciones Quiniela Copa América 2024 (Los Claros)`;
            nombre_correo = "Quiniela Copa América 2024 (Los Claros)";
          } else if (conn.config.database === "quiniela_db_euro") {
            nombre_quiniela = `Tabla De Posiciones Quiniela Eurocopa 2024 (Los Claros)`;
            nombre_correo = "Quiniela Eurocopa 2024 (Los Claros)";
          }

          let nombre_reporte = "";

          if (!ficticios) {
            if (limite === 0) {
              nombre_reporte = `${nombre_quiniela} (Sin Ficticios)`;
            } else {
              nombre_reporte = `${nombre_quiniela} (Sin Ficticios) (Primeros ${limite})`;
            }
          } else {
            if (limite === 0) {
              nombre_reporte = nombre_quiniela;
            } else {
              nombre_reporte = `${nombre_quiniela} (Primeros ${limite})`;
            }
          }

          const pdf_path = path.join(
            __dirname,
            `../../src/utils/reportes/${nombre_reporte}.pdf`
          );

          doc.pipe(fs.createWriteStream(pdf_path));

          doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .text(`${nombre_reporte}`, { align: "center" });
          doc.moveDown();
          doc.moveDown();

          let posicion = 1;

          (async function createTable() {
            const table = {
              headers: ["POSICIÓN", "NOMBRES", "APELLIDOS", "PUNTAJE"],
              rows: [],
            };
            for (const resultado of resultados) {
              if (posicion > limite && limite !== 0) {
                break;
              }

              const row = [
                posicion,
                resultado.nombres,
                resultado.apellidos,
                resultado.puntaje,
              ];

              // @ts-ignore
              table.rows.push(row);

              posicion++;
            }
            await doc.table(table, {
              columnsSize: [70, 170, 170, 60],
              prepareHeader: () => doc.fontSize(11).font("Helvetica-Bold"),
              prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.fontSize(10).font("Helvetica");
              },
            });
          })();

          doc.on("end", () => {
            console.log(
              `${fechaHoraActual()} - Reporte: "${nombre_reporte}" creado exitosamente!`
            );
          });

          doc.end();

          const enviarCorreo = async () => {
            try {
              const message = {
                // @ts-ignore
                from: `"${nombre_correo}" <gestiondeinformacion@grupo-lamar.com>`,
                to: correos.join(", "),
                subject: nombre_reporte,
                text: nombre_reporte,
                attachments: [
                  {
                    filename: `${nombre_reporte}.pdf`,
                    content: fs.createReadStream(pdf_path),
                  },
                ],
              };

              await transporter.sendMail(message);

              console.log(
                `${fechaHoraActual()} - Correo "${nombre_reporte}" enviado exitosamente!`
              );
            } catch (error) {
              console.error(error);
            }
          };

          await enviarCorreo();
        }
      } else {
        console.log(
          `${fechaHoraActual()} - No hay resultados registrados de partidos`
        );
      }
    } catch (error) {
      throw new Error(`Error al crear el reporte: ${error.message}`);
    }
  } else {
    return console.log(
      `${fechaHoraActual()} - Esa conexión a base de datos no está en la lista de permitidas`
    );
  }
};

/**
 * <b>Función para generar reporte de tabla de posiciones de una quiniela de la Copa América LAMAR</b>
 * @param {number} quiniela_id ID de la quiniela a generar el reporte
 * @param {number} limite Límite máximo de posiciones (0 = Sin límite)
 * @param {Array<string>} correos Lista de direcciones de correos donde se enviará el reporte
 */
const tablaPosicionesLAMAR = async (quiniela_id, limite, correos) => {
  if (!quiniela_id) {
    return console.log(`${fechaHoraActual()} - Debes ingresar el quiniela_id`);
  }

  const quiniela = await conn2.query(
    `SELECT * FROM quinielas WHERE quiniela_id = ${quiniela_id}`,
    {
      type: QueryTypes.SELECT,
    }
  );

  if (!quiniela) {
    return console.log(`${fechaHoraActual()} - No existe esa quiniela`);
  }

  try {
    const resultado_partido = await conn2.query(
      "SELECT * FROM partidos INNER JOIN resultado_partidos ON partidos.partido_id = resultado_partidos.partido_id",
      {
        type: QueryTypes.SELECT,
      }
    );

    if (resultado_partido) {
      let resultados = [];

      for (const resultado of resultado_partido) {
        const predicciones = await conn2.query(
          // @ts-ignore
          `SELECT predicciones.*, empleados.empleado_id, empleados.cedula, empleados.nombres, empleados.apellidos, empleados.activo, empresas.quiniela_id, empresas.nombre as nombre_empresa FROM predicciones INNER JOIN empleados ON predicciones.empleado_id = empleados.empleado_id JOIN empresas ON empleados.empresa_id = empresas.empresa_id WHERE predicciones.partido_id = ${resultado.partido_id} AND empresas.quiniela_id = ${quiniela_id}`,
          {
            type: QueryTypes.SELECT,
          }
        );

        if (predicciones) {
          for (const prediccion of predicciones) {
            if (
              // @ts-ignore
              prediccion.goles_equipo_a === null ||
              // @ts-ignore
              prediccion.goles_equipo_b === null
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

        const destPath = path.join(__dirname, `../../src/utils/reportes`);

        crearCarpetaSiNoExiste(destPath);

        // @ts-ignore
        const doc = new PDFDocument({
          bufferPages: true,
          font: "Helvetica",
        });

        let nombre_reporte = "";

        if (limite === 0) {
          // @ts-ignore
          nombre_reporte = `Tabla De Posiciones Quiniela Copa América 2024 (${quiniela[0].nombre})`;
        } else {
          // @ts-ignore
          nombre_reporte = `Tabla De Posiciones Quiniela Copa América 2024 (${quiniela[0].nombre}) (Primeros ${limite})`;
        }

        const pdf_path = path.join(
          __dirname,
          `../../src/utils/reportes/${nombre_reporte}.pdf`
        );

        doc.pipe(fs.createWriteStream(pdf_path));

        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .text(`${nombre_reporte}`, { align: "center" });
        doc.moveDown();
        doc.moveDown();

        let posicion = 1;

        (async function createTable() {
          const table = {
            headers: ["POSICIÓN", "NOMBRES", "APELLIDOS", "EMPRESA", "PUNTAJE"],
            rows: [],
          };
          for (const resultado of resultados) {
            if (posicion > limite && limite !== 0) {
              break;
            }

            const row = [
              posicion,
              resultado.nombres,
              resultado.apellidos,
              resultado.empresa,
              resultado.puntaje,
            ];

            // @ts-ignore
            table.rows.push(row);

            posicion++;
          }
          await doc.table(table, {
            columnsSize: [60, 110, 110, 130, 60],
            prepareHeader: () => doc.fontSize(11).font("Helvetica-Bold"),
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
              doc.fontSize(10).font("Helvetica");
            },
          });
        })();

        doc.on("end", () => {
          console.log(
            `${fechaHoraActual()} - Reporte: "${nombre_reporte}" creado exitosamente!`
          );
        });

        doc.end();

        const enviarCorreo = async () => {
          const message = {
            // @ts-ignore
            from: `"Quiniela Copa América 2024 (${quiniela[0].nombre})" <gestiondeinformacion@grupo-lamar.com>`,
            to: correos.join(", "),
            subject: nombre_reporte,
            text: nombre_reporte,
            attachments: [
              {
                filename: `${nombre_reporte}.pdf`,
                content: fs.createReadStream(pdf_path),
              },
            ],
          };

          await transporter.sendMail(message);

          console.log(
            `${fechaHoraActual()} - Correo "${nombre_reporte}" enviado exitosamente!`
          );
        };

        await enviarCorreo();
      }
    } else {
      console.log(
        `${fechaHoraActual()} - No hay resultados registrados de partidos`
      );
    }
  } catch (error) {
    throw new Error(`Error al crear el reporte: ${error.message}`);
  }
};

module.exports = {
  cargarEmpleados,
  cargarEmpleadosFaltantes,
  cargarEmpleadosExcel,
  tablaPosicionesClaros,
  tablaPosicionesLAMAR,
};
