const { login } = require("../controllers/empleados_controllers");

const getLogin = async (req, res) => {
  const { cedula, clave } = req.query;

  try {
    const response = await login(cedula, clave);

    return res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getLogin,
};
