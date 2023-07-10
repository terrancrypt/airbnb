import { room_images, rooms } from '@prisma/client';
import { DataRespone } from 'src/types';

export type ResponeRooms = DataRespone & { data: rooms[] };

export type ResponeARoom = DataRespone & { data: rooms };

export type ResponeUploadRoomImg = DataRespone & { data: room_images };
