import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class SessionService {
  constructor(
    private redisService: RedisService,
  ) {}

  async createSession(email: string): Promise<string> {
    try {
      const startAt = new Date();
      const tenDaysInMilliseconds = 10 * 24 * 60 * 60 * 1000; // 10 ngày tính bằng mili giây
      const expiredAt = new Date(
        Number(startAt) + tenDaysInMilliseconds,
      ).toString();

      const sessionKey =
        Math.random().toString(36).substring(2) + Date.now().toString(36);

      await this.redisService.getClient().hSet(sessionKey, {
        sessionId: sessionKey,
        email,
        expiredAt,
      });

      const session = await this.redisService
        .getClient()
        .hGet(sessionKey, 'sessionId');

      return session;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async upTimeSession(sessionKey: string) {
    try {
      const currentTime = new Date();
      const tenDaysInMilliseconds = 10 * 24 * 60 * 60 * 1000; // 10 ngày tính bằng mili giây
      const newExpriedAt = new Date(
        Number(currentTime) + tenDaysInMilliseconds,
      ).toString();

      await this.redisService
        .getClient()
        .hSet(sessionKey, 'expriedAt', newExpriedAt);
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async getSession(sessionId: string): Promise<string | null> {
    try {
      const currentTime = new Date();
      const sessionExpiredAt = await this.redisService
        .getClient()
        .hGet(sessionId, 'expiredAt');

      const dateExpiredAt = new Date(sessionExpiredAt);

      if (currentTime < dateExpiredAt) {
        return await this.redisService.getClient().hGet(sessionId, 'sessionId');
      } else {
        return null;
      }
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async deleteSession(sessionKey: string): Promise<boolean> {
    try {
      await this.redisService.getClient().del(sessionKey);
      return true;
    } catch {
      return false;
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    name: 'ScheduleCleanupSession',
  })
  async cleanupExporedSession(): Promise<void> {
    try {
      const currentTime = new Date();
      const { keys } = await this.redisService.getClient().scan(0);
      for (const session of keys) {
        const sessionExpired = await this.redisService
          .getClient()
          .hGet(session, 'expiredAt');
        const dateSessionExpired = new Date(sessionExpired);

        if (currentTime > dateSessionExpired) {
          await this.redisService.getClient().del(session);
        }
      }
    } catch (error) {
      console.log('Error of ScheduleCleanupSession', error);
    }
  }
}
