import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Request } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";

import { AuthGuard } from "./auth.guard";
import { UserModel } from "./users.model";
import { LoginUserDto } from "./auth.dto";
import { CreateUserDto } from "./users.dto";
import { AuthService } from "./auth.service";
import { UserRole } from "src/shared/types/roles.type";
import { Public, Role } from "src/shared/decorators/auth.decorator";

@ApiBearerAuth()
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() data: LoginUserDto) {
    return this.authService.signIn(data.email, data.password);
  }

  @Public()
  @Post("register")
  async register(@Body() data: CreateUserDto) {
    return this.authService.register(data);
  }

  @Get("profile")
  @Role(UserRole.ANY)
  @UseGuards(AuthGuard)
  getProfile(@Request() req: Request & { user: UserModel }) {
    return req.user;
  }
}
