import { UserModel } from "./users.model";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CreateUserDto } from "./users.dto";
import { ClsService } from "nestjs-cls";

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(UserModel)
    private userModel: typeof UserModel,
    private readonly clsService: ClsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserModel> {
    return this.userModel.create(createUserDto as any, {
      transaction: this.clsService.get("transaction"),
    });
  }

  async findOneByEmail(email: string): Promise<UserModel | null> {
    return this.userModel.findOne({
      where: { email },
      transaction: this.clsService.get("transaction"),
    });
  }

  async findOneById(id: number): Promise<UserModel | null> {
    return this.userModel.findByPk(id, {
      transaction: this.clsService.get("transaction"),
    });
  }
}
