const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Empresa", {
    empresa_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    codigo_empresa: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    rif: {
      type: DataTypes.STRING(12),
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });
};
