import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private subscriber: Redis;
  private readonly handlers = new Map<string, ((message: string) => void)[]>();

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url = this.config.get<string>('redisUrl')!;
    this.client = new Redis(url);
    this.subscriber = new Redis(url);

    this.client.on('connect', () => this.logger.log('Redis client connected'));
    this.client.on('error', (err) => this.logger.error('Redis client error', err));

    this.subscriber.on('message', (channel, message) => {
      const fns = this.handlers.get(channel) ?? [];
      fns.forEach((fn) => fn(message));
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
    this.subscriber.disconnect();
  }

  getClient(): Redis {
    return this.client;
  }

  async publish(channel: string, message: string): Promise<void> {
    await this.client.publish(channel, message);
  }

  async subscribe(channel: string, handler: (message: string) => void): Promise<void> {
    const existing = this.handlers.get(channel) ?? [];
    if (existing.length === 0) {
      await this.subscriber.subscribe(channel);
    }
    this.handlers.set(channel, [...existing, handler]);
  }
}
