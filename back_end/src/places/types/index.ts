import { places } from '@prisma/client';
import { DataRespone } from 'src/types';

export type ResponePlaces = DataRespone & { data: places[] };

export type ResponeAPlace = DataRespone & { data: places };
