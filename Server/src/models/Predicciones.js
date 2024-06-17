const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Predicciones", {
    prediccion_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    usuario_id: {
      // Campo relacionado
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    partido_id: {
      // Campo relacionado
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    goles_equipo_a: {
      type: DataTypes.INTEGER(2),
      allowNull: false,
    },
    goles_equipo_b: {
      type: DataTypes.INTEGER(2),
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });
};
