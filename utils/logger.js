import fs from "fs";
import DailyRotateFile from "winston-daily-rotate-file";
import { createLogger, format, transports } from "winston";

const environment = process.env.ENVIRONMENT;
const logging = {
  dir: process.env.LOGGING_DIR || "logs",
  level: process.env.LOGGING_LEVEL || "debug",
  maxSize: process.env.LOGGING_MAX_SIZE || "20m",
  maxFiles: process.env.LOGGING_MAX_FILES || "7d",
  datePattern: process.env.LOGGING_DATE_PATTERN || "YYYY-MM-DD",
};

const { combine, colorize, splat, printf, timestamp } = format;

const keysToFilter = ["password", "token"];

const formatter = printf((info) => {
  const { level, message, timestamp: ts, ...restMeta } = info;

  const meta =
    restMeta && Object.keys(restMeta).length
      ? JSON.stringify(
          restMeta,
          (key, value) => (keysToFilter.includes(key) ? "******" : value),
          2,
        )
      : restMeta instanceof Object
      ? ""
      : restMeta;

  return `[ ${ts} ] - [ ${level} ] ${message} ${meta}`;
});

if (!fs.existsSync(logging.dir)) {
  fs.mkdirSync(logging.dir);
}

let trans = [];

if (environment === "development") {
  trans = [new transports.Console()];
}

const logger = createLogger({
  level: logging.level,
  format: combine(splat(), colorize(), timestamp(), formatter),
  transports: [
    ...trans,
    new DailyRotateFile({
      maxSize: logging.maxSize,
      maxFiles: logging.maxFiles,
      datePattern: logging.datePattern,
      zippedArchive: true,
      filename: `${logging.dir}/${logging.level}-%DATE%.log`,
    }),
  ],
});

export default logger;
