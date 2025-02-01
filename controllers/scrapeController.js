const config = require("../config/config");
const { scrapeProductDescription } = require("../services/ebayScraperSevice");
const { createRequestLogger, errorCodes } = require("../utils/logger");
const { scrapeProductListing } = require("../services/ebayScraperSevice");

const scrapeEbayProducts = async (req, res) => {
  const reqLogger = createRequestLogger(req);
  reqLogger.info("Starting eBay scraping request");

  try {
    const query = req.query.query || "nike";
    const pages = Number(req.query.pages) || 1;
    const limit = Number(req.query.limit) || 10;

    let failedScrapeDescription = 0;

    const allProducts = [];

    reqLogger.debug("Request parameters", { query, pages, limit });

    for (let page = 1; page <= pages; page++) {
      if (allProducts.length >= limit) break;

      const url = config.EBAY_BASE_URL.replace(
        "{query}",
        encodeURIComponent(query)
      ).replace("{page}", page);
      console.log(`Scraping page ${page}: ${url}`);

      const remainingSlots = limit - allProducts.length;
      const products = await scrapeProductListing(url, remainingSlots);

      allProducts.push(...products);
    }

    if (allProducts.length > 0) {
      for (const product of allProducts) {
        try {
          product.description = await scrapeProductDescription(product.link);
        } catch (error) {
          reqLogger.error(`Failed to scrape description`, {
            error: error.message,
            productLink: product.link,
            errorCode: errorCodes.SCRAPING_ERROR,
          });
          product.description = "-";
          failedScrapeDescription++;
        }
      }
    }

    res.json({
      data: allProducts,
      meta: {
        totalProducts: allProducts.length,
        failedScrapesDescription: failedScrapeDescription,
        query,
        pages: pages,
        limit: limit,
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
