import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common"
import type { Response } from "express"

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    // Log the error so we can see it in terminal!
    console.error("🔥 [HttpExceptionFilter] Caught exception:", exception)

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | string[] = "Internal server error"

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()
      if (typeof exceptionResponse === "string") {
        message = exceptionResponse
      } else if (typeof exceptionResponse === "object") {
        message =
          ((exceptionResponse as Record<string, unknown>).message as string) || exception.message
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    })
  }
}
