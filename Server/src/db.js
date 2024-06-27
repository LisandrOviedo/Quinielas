const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

const { DB, DB2, DB3, USERDB, PASSWORD, HOST, DIALECT, PORT_DB } = process.env;

const sequelize = new Sequelize(DB, USERDB, PASSWORD, {
  host: HOST,
  dialect: DIALECT,
  port: PORT_DB,
  logging: false,
  native: false,
  timezone: "-04:00",
});

const sequelize2 = new Sequelize(DB2, USERDB, PASSWORD, {
  host: HOST,
  dialect: DIALECT,
  port: PORT_DB,
  logging: false,
  native: false,
  timezone: "-04:00",
});

const sequelize3 = new Sequelize(DB3, USERDB, PASSWORD, {
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
// Roles 1:1 Empleado
Empleado.belongsTo(Roles, {
  foreignKey: {
    allowNull: false,
    name: "rol_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});
Roles.hasOne(Empleado, {
  foreignKey: {
    allowNull: false,
    name: "rol_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});

// Empresa 1:M Empleado
Empresa.hasMany(Empleado, {
  foreignKey: {
    allowNull: false,
    name: "empresa_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});
Empleado.belongsTo(Empresa, {
  foreignKey: {
    allowNull: false,
    name: "empresa_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});

// Empleado 1:M Predicciones
Empleado.hasMany(Predicciones, {
  foreignKey: {
    allowNull: false,
    name: "empleado_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});
Predicciones.belongsTo(Empleado, {
  foreignKey: {
    allowNull: false,
    name: "empleado_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});

// Torneo 1:M Partidos
Torneo.hasMany(Partido, {
  foreignKey: {
    allowNull: false,
    name: "torneo_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});
Partido.belongsTo(Torneo, {
  foreignKey: {
    allowNull: false,
    name: "torneo_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});

// Equipo 1:M Partidos
Equipo.hasMany(Partido, {
  foreignKey: {
    allowNull: false,
    name: "equipo_a",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});
Partido.belongsTo(Equipo, {
  foreignKey: {
    allowNull: false,
    name: "equipo_a",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});

// Equipo 1:M Partidos
Equipo.hasMany(Partido, {
  foreignKey: {
    allowNull: false,
    name: "equipo_b",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});
Partido.belongsTo(Equipo, {
  foreignKey: {
    allowNull: false,
    name: "equipo_b",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});

// Partido 1:M Predicciones
Partido.hasMany(Predicciones, {
  foreignKey: {
    allowNull: false,
    name: "partido_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});
Predicciones.belongsTo(Partido, {
  foreignKey: {
    allowNull: false,
    name: "partido_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});

// Partido 1:1 Resultado_Partido
Resultado_Partido.belongsTo(Partido, {
  foreignKey: {
    allowNull: false,
    name: "partido_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});
Partido.hasOne(Resultado_Partido, {
  foreignKey: {
    allowNull: false,
    name: "partido_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});

// Quiniela 1:M Empresa
Quiniela.hasMany(Empresa, {
  foreignKey: {
    allowNull: false,
    name: "quiniela_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});
Empresa.belongsTo(Quiniela, {
  foreignKey: {
    allowNull: false,
    name: "quiniela_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
  conn2: sequelize2, // para importart la conexión { conn } = require('./db.js');
  conn3: sequelize3, // para importart la conexión { conn } = require('./db.js');
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
