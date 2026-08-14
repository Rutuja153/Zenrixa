const axios = require("axios");
const Chat = require("../Model/Chat");

const chatWithAI = async (req, res) => {
  try {
    const {
      message,
      userId,
      userName,
    } = req.body;

    // =====================================================
    // CHECK MESSAGE
    // =====================================================

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // =====================================================
    // CHECK USER
    // =====================================================

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // =====================================================
    // CHECK OLLAMA CONFIGURATION
    // =====================================================

    const ollamaUrl = process.env.OLLAMA_URL;
    const ollamaModel =
      process.env.OLLAMA_MODEL || "llama3";

    if (!ollamaUrl) {
      console.error(
        "❌ OLLAMA_URL is not configured in environment variables."
      );

      return res.status(503).json({
        success: false,
        code: "OLLAMA_NOT_CONFIGURED",
        message:
          "Zenrixa AI is not configured on the server.",
      });
    }

    console.log("------------------------------------");
    console.log("🤖 Zenrixa AI Request");
    console.log("User ID:", userId);
    console.log("User Name:", userName);
    console.log("User Message:", message);
    console.log("Ollama URL:", ollamaUrl);
    console.log("Ollama Model:", ollamaModel);
    console.log("------------------------------------");

    // =====================================================
    // AI PROMPT
    // =====================================================

    const prompt = `
You are Zenrixa AI, a women's safety assistant.

User name: ${userName || "User"}

Your job is to provide helpful, calm, practical and safety-focused answers.

Important instructions:
- Give clear and simple answers.
- Prioritize the user's safety.
- Do not provide dangerous instructions.
- If the user is in immediate danger, advise them to use the Zenrixa SOS feature and contact trusted people or emergency services.
- If the user asks for a safe route, provide general safety guidance and suggest using the Zenrixa map feature when appropriate.
- Be supportive and concise.

User message:
${message}
`;

    // =====================================================
    // CALL OLLAMA
    // =====================================================

    let response;

    try {
      response = await axios.post(
        `${ollamaUrl}/api/generate`,
        {
          model: ollamaModel,
          prompt: prompt,
          stream: false,
        },
        {
          timeout: 120000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (ollamaError) {
      console.error("❌ Ollama connection failed");

      console.error(
        "Message:",
        ollamaError.message
      );

      console.error(
        "Code:",
        ollamaError.code
      );

      console.error(
        "Status:",
        ollamaError.response?.status
      );

      console.error(
        "Response:",
        ollamaError.response?.data
      );

      // ===================================================
      // TIMEOUT
      // ===================================================

      if (ollamaError.code === "ECONNABORTED") {
        return res.status(503).json({
          success: false,
          code: "OLLAMA_TIMEOUT",
          message:
            "Zenrixa AI is taking too long to respond. Please try again.",
        });
      }

      // ===================================================
      // CONNECTION REFUSED / OFFLINE
      // ===================================================

      if (
        ollamaError.code === "ECONNREFUSED" ||
        ollamaError.code === "ENOTFOUND" ||
        ollamaError.code === "ECONNRESET"
      ) {
        return res.status(503).json({
          success: false,
          code: "OLLAMA_UNAVAILABLE",
          message:
            "Zenrixa AI is currently unavailable. Please try again later.",
        });
      }

      // ===================================================
      // OLLAMA HTTP ERROR
      // ===================================================

      if (ollamaError.response) {
        return res.status(503).json({
          success: false,
          code: "OLLAMA_ERROR",
          message:
            "Zenrixa AI could not process your request.",
        });
      }

      // ===================================================
      // UNKNOWN AI ERROR
      // ===================================================

      return res.status(503).json({
        success: false,
        code: "AI_CONNECTION_ERROR",
        message:
          "Zenrixa AI is temporarily unavailable.",
      });
    }

    // =====================================================
    // CHECK OLLAMA RESPONSE
    // =====================================================

    if (
      !response ||
      !response.data ||
      !response.data.response
    ) {
      console.error(
        "❌ Invalid response received from Ollama:",
        response?.data
      );

      return res.status(503).json({
        success: false,
        code: "INVALID_AI_RESPONSE",
        message:
          "Zenrixa AI returned an invalid response.",
      });
    }

    const aiReply =
      response.data.response.trim();

    console.log(
      "✅ AI Response:",
      aiReply
    );

    // =====================================================
    // SAVE CHAT TO MONGODB
    // =====================================================

    try {
      const chat = new Chat({
        userId: userId,
        userName: userName || "User",
        message: message,
        response: aiReply,
      });

      await chat.save();

      console.log(
        "✅ Chat saved to MongoDB"
      );
    } catch (databaseError) {
      // Don't make a successful AI response fail
      // only because chat history could not be saved.

      console.error(
        "⚠️ Chat save failed:",
        databaseError.message
      );
    }

    // =====================================================
    // SUCCESS RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,
      reply: aiReply,
      userId: userId,
      userName: userName || "User",
    });

  } catch (error) {
    // =====================================================
    // UNEXPECTED ERROR
    // =====================================================

    console.error(
      "❌ Unexpected Chat Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      code: "CHAT_SERVER_ERROR",
      message:
        "Something went wrong while processing your message.",
    });
  }
};

module.exports = {
  chatWithAI,
};