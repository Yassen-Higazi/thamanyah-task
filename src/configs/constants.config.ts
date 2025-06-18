import { config } from "dotenv-safe";

config();

export const JWT_SECRET = process.env.JWT_SECRET;
export const APP_PORT = parseInt(process.env.APP_PORT || "3000");
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_PORT = parseInt(process.env.DB_PORT || "5432");
export const DB_NAME = process.env.DB_NAME || "thamanyah";
export const DB_USERNAME = process.env.DB_USERNAME;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const ELASTICSEARCH_HOST = process.env.ELASTICSEARCH_HOST || "localhost";
export const ELASTICSEARCH_PORT = parseInt(
  process.env?.ELASTICSEARCH_PORT || "9200",
);
export const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME;
export const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD;

export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = parseInt(
  (process.env.REDIS_PORT as string) || "6379",
);
