import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("ExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json(exception.getResponse());
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === "P2002") {
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: `A record with this ${(exception.meta?.target as string[])?.join(", ") ?? "value"} already exists`,
        });
        return;
      }
      if (exception.code === "P2025") {
        response.status(HttpStatus.NOT_FOUND).json({ statusCode: HttpStatus.NOT_FOUND, message: "Record not found" });
        return;
      }
    }

    this.logger.error(exception instanceof Error ? exception.stack : exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }
}
