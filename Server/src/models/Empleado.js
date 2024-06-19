const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Empleado", {
    empleado_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rol_id: {
      // Campo relacionado
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    empresa_id: {
      // Campo relacionado
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    codigo_empleado: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    cedula: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    clave: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nombres: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    direccion: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });
};
