import { reservations } from '@prisma/client';
import { DataRespone } from 'src/types';

export type ResponeResers = DataRespone & { data: reservations[] };

export type ResponeAReser = DataRespone & { data: reservations };
