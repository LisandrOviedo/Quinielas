const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

const { DB, USERDB, PASSWORD, HOST, DIALECT, PORT_DB } = process.env;

const sequelize = new Sequelize(DB, USERDB, PASSWORD, {
  host: HOST,
  dialect: DIALECT,
  port: PORT_DB,
  logging: false,
  native: false,
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
  Puntajes,
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
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});
Roles.hasOne(Empleado, {
  foreignKey: {
    allowNull: false,
    name: "rol_id",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});

// Empresa 1:M Empleado
Empresa.hasMany(Empleado, {
  foreignKey: {
    allowNull: false,
    name: "empresa_id",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});
Empleado.belongsTo(Empresa, {
  foreignKey: {
    allowNull: false,
    name: "empresa_id",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});

// Empleado 1:M Predicciones
Empleado.hasMany(Predicciones, {
  foreignKey: {
    allowNull: false,
    name: "empleado_id",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});
Predicciones.belongsTo(Empleado, {
  foreignKey: {
    allowNull: false,
    name: "empleado_id",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});

// Torneo 1:M Partidos
Torneo.hasMany(Partido, {
  foreignKey: {
    allowNull: false,
    name: "torneo_id",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});
Partido.belongsTo(Torneo, {
  foreignKey: {
    allowNull: false,
    name: "torneo_id",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});

// Equipo 1:M Partidos
Equipo.hasMany(Partido, {
  foreignKey: {
    allowNull: false,
    name: "equipo_a",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});
Partido.belongsTo(Equipo, {
  foreignKey: {
    allowNull: false,
    name: "equipo_a",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});

// Equipo 1:M Partidos
Equipo.hasMany(Partido, {
  foreignKey: {
    allowNull: false,
    name: "equipo_b",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});
Partido.belongsTo(Equipo, {
  foreignKey: {
    allowNull: false,
    name: "equipo_b",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});

// Partido 1:M Predicciones
Partido.hasMany(Predicciones, {
  foreignKey: {
    allowNull: false,
    name: "partido_id",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});
Predicciones.belongsTo(Partido, {
  foreignKey: {
    allowNull: false,
    name: "partido_id",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});

// Partido 1:1 Resultado_Partido
Resultado_Partido.belongsTo(Partido, {
  foreignKey: {
    allowNull: false,
    name: "partido_id",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});
Partido.hasOne(Resultado_Partido, {
  foreignKey: {
    allowNull: false,
    name: "partido_id",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});

// Predicciones 1:1 Puntajes
Predicciones.belongsTo(Puntajes, {
  foreignKey: {
    allowNull: false,
    name: "prediccion_id",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});
Puntajes.hasOne(Predicciones, {
  foreignKey: {
    allowNull: false,
    name: "prediccion_id",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  },
});

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
  Empleado,
  Empresa,
  Equipo,
  Partido,
  Predicciones,
  Puntajes,
  Resultado_Partido,
  Roles,
  Torneo,
};
