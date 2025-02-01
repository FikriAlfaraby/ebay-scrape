const axios = require("axios");
const cheerio = require("cheerio");
const { extractWithDeepseek } = require("./deepseekService");

const scrapeProductListing = async (url, remainingSlots) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    let productsHTML = [];

    $(".s-item.s-item__pl-on-bottom").each((index, element) => {
      productsHTML.push($(element).html());
    });

    if (productsHTML.length === 0) {
      console.error("No products found on the page.");
      return [];
    }

    const startIndex = 3;
    const relevantHTML = productsHTML
      .slice(startIndex, startIndex + remainingSlots)
      .join("\n");

    const products = await extractWithDeepseek(relevantHTML);

    return products;
  } catch (error) {
    console.error("Error scraping product listings:", error.message);
    throw error;
  }
};

const scrapeProductDescription = async (productUrl) => {
  try {
    const { data } = await axios.get(productUrl);
    const $ = cheerio.load(data);

    const iframeSrc = $("iframe#desc_ifr").attr("src");

    if (!iframeSrc) {
      return "-";
    }

    const { data: iframeData } = await axios.get(iframeSrc);
    const iframe$ = cheerio.load(iframeData);

    const description = iframe$('div[data-testid="x-item-description-child"]')
      .text()
      .trim();

    return description || "-";
  } catch (error) {
    console.error("Error scraping product description", {
      error: error.message,
    });
    return "-";
  }
};

module.exports = { scrapeProductListing, scrapeProductDescription };
