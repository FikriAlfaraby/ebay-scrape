const config = require("../config/config");
const { scrapeProductDescription } = require("../services/ebayScraperSevice");
const { summarizeWithDeepseek } = require("../services/deepseekService");
const { createRequestLogger, errorCodes } = require("../utils/logger");
const { scrapeProductListing } = require("../services/ebayScraperSevice");

const scrapeEbayProducts = async (req, res) => {
  const reqLogger = createRequestLogger(req);
  reqLogger.info("Starting eBay scraping request");

  try {
    const { query = "nike", pages = 1, limit = 10 } = req.query;
    let failedScrapeDescription = 0;
    let failedSummaryCount = 0;

    const allProducts = [];

    reqLogger.debug("Request parameters", { query, pages, limit });

    for (let page = 1; page <= pages; page++) {
      if (allProducts.length >= limit) break;

      const url = config.EBAY_BASE_URL.replace(
        "{query}",
        encodeURIComponent(query)
      ).replace("{page}", page);
      console.log(`Scraping page ${page}: ${url}`);

      const products = await scrapeProductListing(url);

      const remainingSlots = limit - allProducts.length;
      allProducts.push(...products.slice(0, remainingSlots));
    }

    for (const product of allProducts) {
      try {
        const description = await scrapeProductDescription(product.link);
        product.description = description;
      } catch (error) {
        reqLogger.error(`Failed to scrape description`, {
          error: error.message,
          productLink: product.link,
          errorCode: errorCodes.SCRAPING_ERROR,
        });
        product.description = "-";
        failedScrapeDescription++;
      }

      try {
        const summaryAI = await summarizeWithDeepseek(product);
        product.summaryAI = summaryAI;
      } catch (error) {
        reqLogger.error(`Failed to summary product info`, {
          error: error.message,
          productName: product.name,
          errorCode: errorCodes.API_ERROR,
        });
        failedSummaryCount++;
      }
    }

    res.json({
      data: allProducts,
      meta: {
        totalProducts: allProducts.length,
        failedScrapesDescription: failedScrapeDescription,
        failedSummaries: failedSummaryCount,
        query,
        pages,
        limit,
      },
    });
  } catch (error) {
    reqLogger.error("Error scraping eBay", {
      error: error.message,
      errorCode: errorCodes.UNKNOWN_ERROR,
    });
    res.status(500).json({ error: "Failed to scrape data" });
  }
};

module.exports = { scrapeEbayProducts };
