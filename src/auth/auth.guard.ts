import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { ClsService } from "nestjs-cls";
import { JwtService } from "@nestjs/jwt";

import { UserModel } from "./users.model";
import { JWT_SECRET } from "src/configs/constants.config";
import {
  IS_PUBLIC_KEY,
  USER_ROLE_KEY,
} from "src/shared/decorators/auth.decorator";
import { Reflector } from "@nestjs/core";
import { UserRole } from "src/shared/types/roles.type";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly clsService: ClsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic =
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || false;

    if (isPublic) {
      return true;
    }

    const userRole =
      this.reflector.getAllAndOverride<UserRole>(USER_ROLE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || UserRole.USER;

    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const user: UserModel = await this.jwtService.verifyAsync(token, {
        secret: JWT_SECRET,
      });

      if (userRole !== UserRole.ANY && (!user.role || user.role !== userRole))
        return false;

      request["user"] = user;

      this.clsService.set("user", user);
    } catch (err) {
      console.log(err);

      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];

    return type === "Bearer" ? token : undefined;
  }
}
