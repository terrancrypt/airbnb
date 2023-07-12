import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor(private config: ConfigService){}

  async onModuleInit() {
    this.client = createClient({
        url: this.config.get<string>('REDIS_URL'),
      });
    this.client.on('error', (err) => console.log('Redis Client Error', err));

    await this.connect();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.once('ready', () => {
        console.log('Connected to Redis');
        resolve();
      });
      this.client.once('error', (err) => reject(err));
      this.client.connect();
    });
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }

  getClient(): RedisClientType{
    return this.client
  }
}
