import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheOptionsFactory, CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Injectable()
export class RegisConfigService implements CacheOptionsFactory {
    constructor(private configService: ConfigService) {}

    async createCacheOptions(): Promise<CacheModuleOptions> {
        return {
            store: await redisStore({
                socket: {
                    host: this.configService.get<string>('REDIS_HOST'),
                    port: this.configService.get<number>('REDIS_PORT'),
                },
                ttl: 60 * 1000,
            }),
        };
    }
}