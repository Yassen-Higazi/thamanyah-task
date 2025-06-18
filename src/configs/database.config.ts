import { SequelizeModuleOptions } from "@nestjs/sequelize";
import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USERNAME,
} from "./constants.config";

export const sequelizeConfig: SequelizeModuleOptions = {
  dialect: "postgres",
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: true,
  autoLoadModels: true,
};
