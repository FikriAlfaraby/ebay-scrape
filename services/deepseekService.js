const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { logger, logLevels, errorCodes } = require("../utils/logger");

const extractWithDeepseek = async (htmlContent) => {
  const requestId = uuidv4();
  logger.info({ requestId, message: "Sending request to Deepseek..." });

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
            content: `You are a helpful assistant that extracts product information from HTML content. 
                      Extract the following fields: name, price, and link. Additionally, extract any other 
                      fields you can find in the HTML, such as image, subtitle, rating, reviewsCount, 
                      deliveryInfo, quantitySold, or any other relevant details. Each object must contain at least name, price, and link. 
                      If additional fields are found, include them in the object. 
                      Ignore products with the name 'Shop on eBay' or similar placeholder names.`,
          },
          {
            role: "user",
            content: `Extract product information from this HTML content: ${htmlContent}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      },
    });

    logger.info({ requestId, message: "Response received from Deepseek." });

    if (
      !response.data ||
      !response.data.choices ||
      response.data.choices.length === 0
    ) {
      throw new Error("AI response does not contain the expected format.");
    }

    let aiResponse = response.data.choices[0].message.content.trim();
    logger.debug({ requestId, message: "Raw AI response", data: aiResponse });

    aiResponse = aiResponse.replace(/^```json\n|\n```$/g, "").trim();
    aiResponse = aiResponse.trimStart();

    if (!aiResponse.endsWith("]") && aiResponse.startsWith("[")) {
      logger.warn({
        requestId,
        message: "Detected truncated JSON, attempting to fix...",
      });

      aiResponse += "]";
    }

    let extractedData;
    try {
      extractedData = JSON.parse(aiResponse);
    } catch (parseError) {
      logger.error({
        requestId,
        level: logLevels.ERROR,
        errorCode: errorCodes.VALIDATION_ERROR,
        message: "Failed to parse JSON from AI response.",
        error: parseError.message,
      });
      return [];
    }

    if (typeof extractedData === "object" && !Array.isArray(extractedData)) {
      extractedData = [extractedData];
    } else if (!Array.isArray(extractedData)) {
      logger.error({
        requestId,
        level: logLevels.ERROR,
        errorCode: errorCodes.VALIDATION_ERROR,
        message: "AI did not return a valid array or object of products.",
      });
      return [];
    }

    const sanitizedData = extractedData.map((product) => {
      Object.keys(product).forEach((key) => {
        if (product[key] === "" || product[key] === null) {
          product[key] = "-";
        }
      });
      return product;
    });

    logger.info({
      requestId,
      message: `Successfully extracted ${sanitizedData.length} products.`,
    });

    sanitizedData.forEach((product, index) => {
      logger.debug({
        requestId,
        message: `Product ${index + 1}`,
        data: product,
      });
    });

    return sanitizedData;
  } catch (error) {
    logger.error({
      requestId,
      level: logLevels.ERROR,
      errorCode: errorCodes.API_ERROR,
      message: "Error while extracting data with Deepseek.",
      error: error.message,
    });
    return [];
  }
};

module.exports = { extractWithDeepseek };
