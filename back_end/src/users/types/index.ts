import { users } from "@prisma/client";
import { DataRespone } from "src/types";

export type ResponeUsers = DataRespone & {data: users[]};

export type ResponeAUser = DataRespone & {data: users};