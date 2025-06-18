/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Response } from "express";
import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Catch()
export class ServeStaticExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status);

    console.log(exception, status);

    if (
      exception?.code === "ENOENT" ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      exception.response?.message?.includes("ENOENT")
    ) {
      return response.send({
        ...exception.response,
        message: "File Not Found",
      });
    }

    response.send(exception.response);
  }
}
