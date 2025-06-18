import {
  Injectable,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
} from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { Sequelize, Transaction } from "sequelize";
import { catchError, finalize, map, Observable } from "rxjs";
import { InjectConnection } from "@nestjs/sequelize";

@Injectable()
export class TransactionsInterceptor implements NestInterceptor {
  constructor(
    private readonly clsService: ClsService,
    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}

  async intercept(
    _: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const transaction = await this.sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
    });

    this.clsService.set("transaction", transaction);

    return next.handle().pipe(
      map(async (res) => {
        await transaction.commit();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return res;
      }),

      catchError(async (err) => {
        await transaction.rollback();

        throw err;
      }),

      finalize(() => {
        this.clsService.set("transaction", undefined);
      }),
    );
  }
}
