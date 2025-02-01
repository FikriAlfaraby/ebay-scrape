const express = require("express");
const { scrapeEbayProducts } = require("../controllers/scrapeController");

const router = express.Router();

router.get("/ebay", scrapeEbayProducts);

module.exports = router;
