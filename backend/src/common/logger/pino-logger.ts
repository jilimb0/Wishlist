import { LoggerService } from "@nestjs/common"
import pino from "pino"

export class PinoLogger implements LoggerService {
  private logger: pino.Logger

  constructor(context?: string) {
    this.logger = pino({
      level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
      transport:
        process.env.NODE_ENV !== "production"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
      ...(context ? { name: context } : {}),
    })
  }

  log(message: unknown, context?: string) {
    this.logger.info({ context }, message as string)
  }

  error(message: unknown, trace?: string, context?: string) {
    this.logger.error({ context, trace }, message as string)
  }

  warn(message: unknown, context?: string) {
    this.logger.warn({ context }, message as string)
  }

  debug(message: unknown, context?: string) {
    this.logger.debug({ context }, message as string)
  }

  verbose(message: unknown, context?: string) {
    this.logger.trace({ context }, message as string)
  }

  static create(context?: string): PinoLogger {
    return new PinoLogger(context)
  }
}
