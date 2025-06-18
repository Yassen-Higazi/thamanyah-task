/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { compare, hash } from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";

import { CreateUserDto } from "./users.dto";
import { UserAttr, UserModel } from "./users.model";
import { UsersRepository } from "./users.repository";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersRepository,
  ) {}

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ access_token: string; user: UserAttr }> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user)
      throw new UnauthorizedException({
        message: "email or password is not correct",
      });

    const isMatch = await compare(pass, user.password);

    if (!isMatch) {
      throw new UnauthorizedException({
        message: "email or password is not correct",
      });
    }

    // NOTE: Do not put all user data in token
    const payload = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    return {
      user: payload,
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findOneByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new BadRequestException("User with this email already exists.");
    }

    const hashedPassword = await hash(createUserDto.password, 10);

    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = newUser.toJSON();

    return result as UserModel;
  }
}
