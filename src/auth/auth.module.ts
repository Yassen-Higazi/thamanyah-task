import { JwtModule } from "@nestjs/jwt";
import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { SequelizeModule } from "@nestjs/sequelize";

import { UserModel } from "./users.model";
import { AuthService } from "./auth.service";
import { UsersRepository } from "./users.repository";
import { JWT_SECRET } from "src/configs/constants.config";

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersRepository],
  imports: [
    JwtModule.register({
      global: true,
      secret: JWT_SECRET,
      signOptions: { expiresIn: "600s" },
    }),
    SequelizeModule.forFeature([UserModel]),
  ],
})
export class AuthModule {}
