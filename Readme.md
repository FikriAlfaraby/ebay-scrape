# eBay Scraper with Deepseek AI Integration

A Node.js application for scraping eBay product data with AI-powered enhancements using Deepseek.

## Features

- Scrape product information like name, price, etc., from eBay
- Handle pagination to scrape multiple pages
- AI-powered product information enhancement using Deepseek
- Comprehensive logging and error handling

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/FikriAlfaraby/ebay-scrape.git
   cd ebay-scrape
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. **Configure LM Studio with Deepseek Model:**
   
   - Download and install **[LM Studio](https://lmstudio.ai/)**
   - Open **LM Studio**, then search for model **deepseek-coder-v2-lite-instruct**
   - Download the model and ensure **LM Studio's local server** is running properly
   - Use the default LM Studio endpoint:  
     ```
     http://localhost:1234/v1/chat/completions
     ```
   - Ensure the model used in the code is:
     ```json
     {
       "model": "deepseek-coder-v2-lite-instruct"
     }
     ```

4. **Start the server:**

   ```bash
   npm run dev
   ```

## API Endpoints

### GET /api/scrape

Scrape eBay products

**Parameters:**

- `query`: Search query (default: "nike")
- `pages`: Number of pages to scrape (default: 1)
- `limit`: Products per page (default: 10)

**Example:**

```bash
GET /api/ebay?query=adidas&pages=2&limit=5
```

## Project Structure

```
.
├── config/            # Configuration files
├── controllers/       # Route controllers
├── logs/              # Application logs
├── routes/            # API route definitions
├── services/          # External service integrations
├── utils/             # Utility functions
├── app.js             # Main application file
└── package.json       # NPM dependencies
```

## Dependencies

- Node.js (v18+)
- Express
- Axios
- Cheerio
- Winston (logging)
- Dotenv
- Deepseek API using LM Studio

