const axios = require("axios");
const Chat = require("../Model/Chat");

const chatWithAI = async (req, res) => {
  try {
    const {
      message,
      userId,
      userName,
    } = req.body;

    // Check message
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Check user
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    console.log("User ID:", userId);
    console.log("User Name:", userName);
    console.log("User Message:", message);

    // Send message to Ollama
    const response = await axios.post(
      `${process.env.OLLAMA_URL}/api/generate`,
      {
        model: process.env.OLLAMA_MODEL || "llama3",

        prompt: `
You are Zenrixa AI, a women's safety assistant.

User name: ${userName || "User"}

Give helpful, calm and safety-focused answers.

If the user is in immediate danger, advise them to use the SOS feature and contact trusted people or emergency services.

User message:
${message}
        `,

        stream: false,
      }
    );

    const aiReply = response.data.response;

    console.log("AI Response:", aiReply);

    // Save chat in MongoDB
    const chat = new Chat({
      userId: userId,
      userName: userName || "User",
      message: message,
      response: aiReply,
    });

    await chat.save();

    return res.status(200).json({
      success: true,
      reply: aiReply,
      userId: userId,
      userName: userName,
    });

  } catch (error) {
    console.error(
      "Ollama Error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "AI response failed",
      error:
        error.response?.data?.error ||
        error.message,
    });
  }
};

module.exports = {
  chatWithAI,
};