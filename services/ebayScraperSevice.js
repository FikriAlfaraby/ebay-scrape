const axios = require("axios");
const cheerio = require("cheerio");
const { logger, errorCodes } = require("../utils/logger");

const scrapeProductListing = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const products = [];

    $(".s-item.s-item__pl-on-bottom").each((index, element) => {
      const name = $(element).find(".s-item__title").text().trim();

      const price = $(element).find(".s-item__price").text().trim() || "-";

      const link = $(element).find(".s-item__link").attr("href");

      const image = $(element).find(".s-item__image img").attr("src") || "-";

      const subtitle =
        $(element).find(".s-item__subtitle .SECONDARY_INFO").text().trim() ||
        "-";

      const ratingSvgCount = $(element).find(".x-star-rating svg").length;
      const rating = ratingSvgCount > 0 ? (ratingSvgCount / 1).toFixed(1) : "-"; // Convert SVG count to decimal rating

      const reviewsCount =
        $(element)
          .find(".s-item__reviews-count")
          .text()
          .trim()
          .replace(/\D+/g, "") || "-";

      const deliveryInfo =
        $(element)
          .find(".s-item__shipping.s-item__logisticsCost")
          .text()
          .trim() || "-";

      const quantitySold =
        $(element).find(".s-item__quantitySold .BOLD").text().trim() || "-";

      if (name === "Shop on eBay" || price === "-" || !link) {
        return;
      }

      const product = {
        name,
        price,
        link,
        image,
        subtitle,
        rating,
        reviewsCount,
        deliveryInfo,
        quantitySold,
      };
      products.push(product);
    });

    return products;
  } catch (error) {
    logger.error("Error scraping product listings", {
      error: error.message,
      errorCode: errorCodes.SCRAPING_ERROR,
    });
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
