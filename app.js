require("dotenv").config();
const express = require("express");
const scrapeRoutes = require("./routes/scrapeRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", scrapeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
