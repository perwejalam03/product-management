import winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf } = winston.format;

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: "./logs/%DATE%.log",
  datePattern: "YYYY-MM-DD",
});

const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    printf((info) => `[${info.timestamp}], ${info.message}`)
  ),
  transports: [fileRotateTransport],
});

// Add console transport in development environment
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;

