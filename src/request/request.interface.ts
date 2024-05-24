import { Request } from "@nestjs/common";
import { User } from "src/user/entities/user.entity";

export interface PublicRequest extends Request{
    //TODO: Implement PublicRequest
}


export interface RoleRequest extends PublicRequest{
    currentRoleCodes: string[]
}

export interface ProtectedRequest extends RoleRequest{
    user: User;
    accessToken: string;
}

export interface Tokens{
    accessToken: string;
    refreshToken: string;
}