const Emergency = require("../Model/Emergency");

const getEmergencyNumbers = async (req, res) => {
  try {
    const numbers = await Emergency.find();

    res.status(200).json({
      success: true,
      data: numbers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getEmergencyNumbers,
};