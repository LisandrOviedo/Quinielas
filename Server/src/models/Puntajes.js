const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Puntajes", {
    puntaje_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    prediccion_id: {
      // Campo relacionado
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    puntos_obtenidos: {
      type: DataTypes.INTEGER(5),
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });
};
