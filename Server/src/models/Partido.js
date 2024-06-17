const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Partido", {
    partido_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    torneo_id: {
      // Campo relacionado
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipo_partido: {
      type: DataTypes.ENUM(
        "Fase de grupos",
        "Octavos de final",
        "Cuartos de final",
        "Semifinal",
        "Tercer lugar",
        "Final"
      ),
      allowNull: false,
    },
    numero_jornada: {
      type: DataTypes.INTEGER(2),
      allowNull: false,
    },
    equipo_a: {
      // Campo relacionado
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    equipo_b: {
      // Campo relacionado
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha_hora_partido: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });
};
