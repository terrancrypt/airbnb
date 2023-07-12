import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { sessions } from '@prisma/client';
import { PrismaSevice } from 'src/prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaSevice) {}

  async createSession(email: string): Promise<sessions> {
    try {
      const startTime = new Date();
      const tenDaysInMilliseconds = 10 * 24 * 60 * 60 * 1000; // 10 ngày tính bằng mili giây
      const endTime = new Date(Number(startTime) + tenDaysInMilliseconds);

      const session = await this.prisma.sessions.create({
        data: {
          email,
          valid: true,
          start_time: startTime,
          end_time: endTime,
        },
      });

      return session;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async upTimeSession(sessionId: number) {
    try {
      const startTime = new Date();
      const tenDaysInMilliseconds = 10 * 24 * 60 * 60 * 1000; // 10 ngày tính bằng mili giây
      const endTime = new Date(Number(startTime) + tenDaysInMilliseconds);

      await this.prisma.sessions.update({
        where: {
          id: sessionId,
        },
        data: {
          end_time: endTime,
        },
      });
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async getSession(sessionId: number): Promise<sessions | null> {
    try {
      const session = await this.prisma.sessions.findUnique({
        where: {
          id: sessionId,
        },
      });

      return session && session.valid ? session : null;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async deleleSession(sessionId: number): Promise<boolean> {
    try {
      await this.prisma.sessions.delete({
        where:{
          id: sessionId
        }
      })

      return true;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    name: 'ScheduleCleanupSession',
  })
  async cleanupExporedSession(): Promise<void> {
    const expiredSessions = await this.getExpiredSession();
    if (expiredSessions) {
      for (const session of expiredSessions) {
        await this.prisma.sessions.delete({
          where: {
            id: session.id,
          },
        });
      }
    }
  }

  async getExpiredSession(): Promise<sessions[]> {
    const currentTime = new Date();
    const expiredSession = await this.prisma.sessions.findMany({
      where: {
        end_time: {
          lte: currentTime,
        },
      },
    });

    const inValidSession = await this.prisma.sessions.findMany({
      where: {
        valid: false,
      },
    });
    return [...expiredSession, ...inValidSession];
  }
}
