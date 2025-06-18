/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";
import { map } from "rxjs/operators";
import { ClsService } from "nestjs-cls";
import { Pagination } from "../types/pagination.type";

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    let pageSize = parseInt(request.query.page_size as string, 10);

    if (isNaN(pageSize)) pageSize = 20;

    pageSize = Math.max(5, Math.min(50, pageSize));

    let pageNumber = parseInt(request.query.page_number as string, 10);

    if (isNaN(pageNumber) || pageNumber < 1) pageNumber = 1;

    const limit = pageSize;
    const offset = (pageNumber - 1) * pageSize;

    this.cls.set<Pagination>("pagination", {
      pageSize,
      pageNumber,
      limit,
      offset,
    });

    return next.handle().pipe(
      map((data: Record<string, any>) => {
        if (
          typeof data === "object" &&
          data !== null &&
          Array.isArray(data?.rows as Array<any>) &&
          typeof data?.count === "number"
        ) {
          const totalPages = Math.ceil(data?.count / pageSize);

          const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
          const previousPage = pageNumber > 1 ? pageNumber - 1 : null;

          return {
            rows: data?.rows,
            count: data?.count,
            pagination: {
              pageNumber,
              nextPage,
              totalPages,
              previousPage,
              pageSize: Math.min(pageSize, data?.count),
            },
          };
        }

        return data;
      }),
    );
  }
}
