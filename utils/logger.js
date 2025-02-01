const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

const createRequestLogger = (req) => {
  const requestId = uuidv4();
  req.requestId = requestId;
  
  return logger.child({
    requestId,
    path: req.path,
    method: req.method
  });
};

const logLevels = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

const errorCodes = {
  SCRAPING_ERROR: 'SCRAPING_ERROR',
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

module.exports = {
  logger,
  createRequestLogger,
  logLevels,
  errorCodes
};
