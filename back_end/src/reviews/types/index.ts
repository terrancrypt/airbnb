import { reservations, reviews } from '@prisma/client';
import { DataRespone } from 'src/types';

export type ResponeReviews = DataRespone & { data: reviews[] };

export type ResponeAReview = DataRespone & { data: reviews };

export type ReviewType = reviews & { reservations: reservations };
