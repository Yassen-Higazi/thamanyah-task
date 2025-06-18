import { join } from "path";
import { ClsModule } from "nestjs-cls";
import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { BullModule } from "@nestjs/bullmq";
import { SequelizeModule } from "@nestjs/sequelize";
import { BullBoardModule } from "@bull-board/nestjs";
import { ExpressAdapter } from "@bull-board/express";
import { ServeStaticModule } from "@nestjs/serve-static";
import { MulterModule } from "@nestjs/platform-express";

import { CmsModule } from "./cms/cms.module";
import { AuthModule } from "./auth/auth.module";
import { sequelizeConfig } from "./configs/database.config";
import { DiscoveryModule } from "./discovery/discovery.module";
import { ServeStaticExceptionFilter } from "./shared/filters/staticServer.filter";
import { REDIS_HOST, REDIS_PORT } from "./configs/constants.config";

@Module({
  providers: [
    {
      // Handle Static server Not found Error (prenvet path disclouser).
      provide: APP_FILTER,
      useClass: ServeStaticExceptionFilter,
    },
  ],
  controllers: [],
  imports: [
    CmsModule,
    AuthModule,
    DiscoveryModule,
    SequelizeModule.forRoot(sequelizeConfig),
    MulterModule.register(),
    ClsModule.forRoot({
      global: true,
      guard: { mount: true },
    }),
    BullModule.forRoot({
      connection: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
    }),
    BullBoardModule.forRoot({
      route: "/queues",
      adapter: ExpressAdapter, // Or FastifyAdapter from `@bull-board/fastify`
    }),
    ServeStaticModule.forRoot({
      serveRoot: "/static",
      serveStaticOptions: {
        fallthrough: false,
      },
      rootPath: join(__dirname, "..", "..", "uploads"),
    }),
  ],
})
export class AppModule {}
