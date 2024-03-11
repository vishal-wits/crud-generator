import winston, { format, transports } from "winston"
import LokiTransport from "winston-loki"
import "dotenv/config"

const commonOptions: winston.LoggerOptions = {
  level: "info",
  format: winston.format.combine(
    winston.format.printf(({ level, message }) => {
      return `[${level.toUpperCase()}]: ${message}`
    }),
  ),
}

//using winston for local env
const localConfig: winston.LoggerOptions = {
  transports: [new winston.transports.Console()],
}

//using winston-cloudwatch for production
const productionConfig: winston.LoggerOptions = {
  transports: [
    new LokiTransport({
      host: process.env.LOKI_HOST as string,
      labels: { app: "crud_generator" },
      json: true,
      format: format.json(),
      replaceTimestamp: true,
      onConnectionError: (err: any) => logger.error(err),
    }),
    new transports.Console({
      format: format.combine(format.simple(), format.colorize()),
    }),
  ],
}

const envLocation = process.env.NODE_ENV || ""
const config: winston.LoggerOptions = ["dev", "staging", "production"].includes(envLocation) ? productionConfig : localConfig

const logger = winston.createLogger({ ...commonOptions, ...config })
export { logger }
