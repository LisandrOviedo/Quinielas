const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Quiniela", {
    quiniela_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });
};
