//Dùng để "dán nhãn" xem API nào cần quyền gì
import { SetMetadata } from "@nestjs/common";
import { Role } from "src/common/enums/role.enum";

export const ROLES_KEY = 'roles';
//(...roles: Role[]) tham số đầu vào,  ... nghĩa là cho phép truyền bao nhiêu cũng được
//tất cả truyền vào và gom thành 1 mảng tên roles
export const Roles = (...roles:Role[]) => SetMetadata(ROLES_KEY,roles);