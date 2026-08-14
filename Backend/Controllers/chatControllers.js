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
        code: "MESSAGE_REQUIRED",
        message: "Message is required",
      });
    }

    // =====================================================
    // CHECK USER
    // =====================================================

    if (!userId) {
      return res.status(400).json({
        success: false,
        code: "USER_ID_REQUIRED",
        message: "User ID is required",
      });
    }

    // =====================================================
    // OLLAMA CONFIGURATION
    // =====================================================

    const ollamaUrl = process.env.OLLAMA_URL;
    const ollamaModel =
      process.env.OLLAMA_MODEL || "llama3";
    const ollamaApiKey =
      process.env.OLLAMA_API_KEY;

    if (!ollamaUrl) {
      console.error(
        "❌ OLLAMA_URL is missing"
      );

      return res.status(503).json({
        success: false,
        code: "OLLAMA_NOT_CONFIGURED",
        message:
          "OLLAMA_URL is not configured on the server.",
      });
    }

    if (!ollamaApiKey) {
      console.error(
        "❌ OLLAMA_API_KEY is missing"
      );

      return res.status(503).json({
        success: false,
        code: "OLLAMA_API_KEY_MISSING",
        message:
          "Ollama API key is not configured on the server.",
      });
    }

    // Remove trailing slash
    const baseUrl = ollamaUrl.replace(/\/+$/, "");

    console.log("------------------------------------");
    console.log("🤖 Zenrixa AI Request");
    console.log("User ID:", userId);
    console.log("User Name:", userName);
    console.log("User Message:", message);
    console.log("Ollama URL:", baseUrl);
    console.log("Ollama Model:", ollamaModel);
    console.log(
      "Ollama API Key:",
      ollamaApiKey ? "Present" : "Missing"
    );
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
        `${baseUrl}/api/generate`,
        {
          model: ollamaModel,
          prompt: prompt,
          stream: false,
        },
        {
          timeout: 120000,

          headers: {
            "Content-Type": "application/json",

            // IMPORTANT:
            // Send Ollama API key
            Authorization: `Bearer ${ollamaApiKey}`,
          },
        }
      );

    } catch (ollamaError) {
      console.error(
        "❌ OLLAMA REQUEST FAILED"
      );

      console.error(
        "Error message:",
        ollamaError.message
      );

      console.error(
        "Error code:",
        ollamaError.code
      );

      console.error(
        "HTTP status:",
        ollamaError.response?.status
      );

      console.error(
        "Ollama response:",
        ollamaError.response?.data
      );

      // ===================================================
      // TIMEOUT
      // ===================================================

      if (
        ollamaError.code ===
        "ECONNABORTED"
      ) {
        return res.status(503).json({
          success: false,
          code: "OLLAMA_TIMEOUT",
          message:
            "Ollama AI request timed out.",
          error:
            ollamaError.message,
        });
      }

      // ===================================================
      // NETWORK ERROR
      // ===================================================

      if (
        ollamaError.code ===
          "ECONNREFUSED" ||
        ollamaError.code ===
          "ENOTFOUND" ||
        ollamaError.code ===
          "ECONNRESET"
      ) {
        return res.status(503).json({
          success: false,
          code: "OLLAMA_UNAVAILABLE",
          message:
            "Cannot connect to Ollama.",
          error:
            ollamaError.message,
        });
      }

      // ===================================================
      // HTTP ERROR
      // ===================================================

      if (ollamaError.response) {
        const status =
          ollamaError.response.status;

        const data =
          ollamaError.response.data;

        return res.status(503).json({
          success: false,
          code: "OLLAMA_HTTP_ERROR",
          message:
            `Ollama returned HTTP ${status}.`,
          error:
            data?.error ||
            data?.message ||
            ollamaError.message,
          status: status,
        });
      }

      // ===================================================
      // UNKNOWN ERROR
      // ===================================================

      return res.status(503).json({
        success: false,
        code: "AI_CONNECTION_ERROR",
        message:
          "Ollama request failed.",
        error:
          ollamaError.message,
      });
    }

    // =====================================================
    // CHECK RESPONSE
    // =====================================================

    console.log(
      "🤖 Ollama response received:",
      response?.data
    );

    if (
      !response ||
      !response.data
    ) {
      return res.status(503).json({
        success: false,
        code: "INVALID_AI_RESPONSE",
        message:
          "Ollama returned an empty response.",
      });
    }

    // Ollama /api/generate normally returns "response"
    const aiReply =
      response.data.response?.trim();

    if (!aiReply) {
      console.error(
        "❌ No AI response text:",
        response.data
      );

      return res.status(503).json({
        success: false,
        code: "INVALID_AI_RESPONSE",
        message:
          "Ollama did not return an AI response.",
        error:
          response.data.error ||
          "Empty response received.",
      });
    }

    console.log(
      "✅ AI Response:",
      aiReply
    );

    // =====================================================
    // SAVE CHAT
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
      console.error(
        "⚠️ Chat save failed:",
        databaseError.message
      );
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    return res.status(200).json({
      success: true,
      reply: aiReply,
      userId: userId,
      userName:
        userName || "User",
    });

  } catch (error) {

    console.error(
      "❌ Unexpected Chat Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      code: "CHAT_SERVER_ERROR",
      message:
        "Something went wrong while processing your message.",
      error: error.message,
    });
  }
};

module.exports = {
  chatWithAI,
};