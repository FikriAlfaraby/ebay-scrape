const axios = require("axios");

const summarizeWithDeepseek = async (product) => {
  try {
    const response = await axios({
      method: "post",
      url: "http://localhost:1234/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        model: "deepseek-coder-v2-lite-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes product information concisely. Summarize the product details in 25 words or less, focusing on the key features and benefits. Use simple and clear language.",
          },
          {
            role: "user",
            content: `Summarize this product in 25 words or less: ${product}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 20,
        stream: false,
      },
    });

    const summary = response.data.choices[0].message.content.trim();
    return summary;
  } catch (error) {
    console.error("Error summarizing with Ollama Studio:", error);
    throw error;
  }
};

module.exports = { summarizeWithDeepseek };
