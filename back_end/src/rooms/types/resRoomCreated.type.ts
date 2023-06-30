import { rooms } from "@prisma/client";

export type resRoomCreated = {
    message: string;
    data: rooms
}