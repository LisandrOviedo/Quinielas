/**
 * <b>Conexión a la base de datos y relación de tablas</b>
 * @module "src/db.js"
 */

const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

const {
  DB,
  DB_AMERICA_LAMAR,
  DB_AMERICA_CLAROS,
  DB_EURO_CLAROS,
  USERDB,
  PASSWORD,
  HOST,
  DIALECT,
  PORT_DB,
} = process.env;

/**
 * <b>Conexión a la base de datos principal</b>
 */
// @ts-ignore
const sequelize = new Sequelize(DB, USERDB, PASSWORD, {
  host: HOST,
  dialect: DIALECT,
  port: PORT_DB,
  logging: false,
  native: false,
  timezone: "-04:00",
});

/**
 * <b>Conexión a la base de datos de la Copa América LAMAR</b>
 */
// @ts-ignore
const sequelize2 = new Sequelize(DB_AMERICA_LAMAR, USERDB, PASSWORD, {
  host: HOST,
  dialect: DIALECT,
  port: PORT_DB,
  logging: false,
  native: false,
  timezone: "-04:00",
});

/**
 * <b>Conexión a la base de datos de la Copa América Claros</b>
 */
// @ts-ignore
const sequelize3 = new Sequelize(DB_AMERICA_CLAROS, USERDB, PASSWORD, {
  host: HOST,
  dialect: DIALECT,
  port: PORT_DB,
  logging: false,
  native: false,
  timezone: "-04:00",
});

/**
 * <b>Conexión a la base de datos de la EURO Copa Claros</b>
 */
// @ts-ignore
const sequelize4 = new Sequelize(DB_EURO_CLAROS, USERDB, PASSWORD, {
  host: HOST,
  dialect: DIALECT,
  port: PORT_DB,
  logging: false,
  native: false,
  timezone: "-04:00",
});

const basename = path.basename(__filename);

const modelDefiners = [];

fs.readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
  });

modelDefiners.forEach((model) => model(sequelize));

let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
// @ts-ignore
sequelize.models = Object.fromEntries(capsEntries);

const {
  Empleado,
  Empresa,
  Equipo,
  Partido,
  Predicciones,
  Quiniela,
  Resultado_Partido,
  Roles,
  Torneo,
} = sequelize.models;

// RELACIONES DE MODELOS (TABLAS)
// Roles 1:M Empleado
Roles.hasMany(Empleado, {
  foreignKey: {
    allowNull: false,
    name: "rol_id",
  },
});
Empleado.belongsTo(Roles, {
  foreignKey: {
    allowNull: false,
    name: "rol_id",
  },
});

// Empresa 1:M Empleado
Empresa.hasMany(Empleado, {
  foreignKey: {
    allowNull: false,
    name: "empresa_id",
  },
});
Empleado.belongsTo(Empresa, {
  foreignKey: {
    allowNull: false,
    name: "empresa_id",
  },
});

// Empleado 1:M Predicciones
Empleado.hasMany(Predicciones, {
  foreignKey: {
    allowNull: false,
    name: "empleado_id",
  },
});
Predicciones.belongsTo(Empleado, {
  foreignKey: {
    allowNull: false,
    name: "empleado_id",
  },
});

// Torneo 1:M Partidos
Torneo.hasMany(Partido, {
  foreignKey: {
    allowNull: false,
    name: "torneo_id",
  },
});
Partido.belongsTo(Torneo, {
  foreignKey: {
    allowNull: false,
    name: "torneo_id",
  },
});

// Equipo 1:M Partidos
Equipo.hasMany(Partido, {
  foreignKey: {
    allowNull: false,
    name: "equipo_a",
  },
});
Partido.belongsTo(Equipo, {
  foreignKey: {
    allowNull: false,
    name: "equipo_a",
  },
});

// Equipo 1:M Partidos
Equipo.hasMany(Partido, {
  foreignKey: {
    allowNull: false,
    name: "equipo_b",
  },
});
Partido.belongsTo(Equipo, {
  foreignKey: {
    allowNull: false,
    name: "equipo_b",
  },
});

// Partido 1:M Predicciones
Partido.hasMany(Predicciones, {
  foreignKey: {
    allowNull: false,
    name: "partido_id",
  },
});
Predicciones.belongsTo(Partido, {
  foreignKey: {
    allowNull: false,
    name: "partido_id",
  },
});

// Partido 1:1 Resultado_Partido
Resultado_Partido.belongsTo(Partido, {
  foreignKey: {
    allowNull: false,
    name: "partido_id",
  },
});
Partido.hasOne(Resultado_Partido, {
  foreignKey: {
    allowNull: false,
    name: "partido_id",
  },
});

// Quiniela 1:M Empresa
Quiniela.hasMany(Empresa, {
  foreignKey: {
    allowNull: false,
    name: "quiniela_id",
  },
});
Empresa.belongsTo(Quiniela, {
  foreignKey: {
    allowNull: false,
    name: "quiniela_id",
  },
});

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
  conn2: sequelize2, // para importart la conexión { conn } = require('./db.js');
  conn3: sequelize3, // para importart la conexión { conn } = require('./db.js');
  conn4: sequelize4, // para importart la conexión { conn } = require('./db.js');
  Empleado,
  Empresa,
  Equipo,
  Partido,
  Predicciones,
  Quiniela,
  Resultado_Partido,
  Roles,
  Torneo,
};
