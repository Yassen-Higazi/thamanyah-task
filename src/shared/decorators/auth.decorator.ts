import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../types/roles.type";

export const IS_PUBLIC_KEY = "isPublic";

export const USER_ROLE_KEY = "UserRole";

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const Role = (role: UserRole = UserRole.USER) =>
  SetMetadata(USER_ROLE_KEY, role);
