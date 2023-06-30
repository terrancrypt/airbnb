import { users } from "@prisma/client";
import { TokensType } from "../types";

export class UserResponeData{
    message: string;
    data: users;
    tokens: TokensType;
}