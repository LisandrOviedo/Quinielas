const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Empresa", {
    empresa_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    quiniela_id: {
      // Campo relacionado
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    codigo_empresa: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    rif: {
      type: DataTypes.STRING(12),
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });
};
