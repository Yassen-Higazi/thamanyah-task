import { DataTypes } from "sequelize";
import { ApiProperty } from "@nestjs/swagger";
import { Table, Column, Unique, IsEmail } from "sequelize-typescript";

import { UserRole } from "src/shared/types/roles.type";
import { BaseModel } from "src/shared/models/base.model";

export class UserAttr {
  @ApiProperty({
    description: "The name of the user",
    example: "Yassen Higazi",
  })
  name: string;

  @ApiProperty({ description: "User Email", example: "yassenhigazi@gmail.com" })
  email: string;

  @ApiProperty({ description: "User phone number", example: "0555555551" })
  phone?: string;

  @ApiProperty({
    description: "User Role",
    example: UserRole.USER.toString(),
    type: () => UserRole,
  })
  role: UserRole;
}

@Table
export class UserModel extends BaseModel {
  @Unique
  @IsEmail
  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  declare phone: string;

  @Column({
    allowNull: false,
    defaultValue: UserRole.USER,
    type: DataTypes.ENUM(...Object.values(UserRole)),
  })
  declare role: UserRole;
}
