const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Torneo", {
    torneo_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ruta_imagen: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });
};
