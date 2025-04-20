import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    if (typeof (this as any).$connect === 'function') {
      await (this as any).$connect();
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    if (typeof (this as any).$on === 'function') {
      (this as any).$on('beforeExit', async () => {
        await app.close();
      });
    }
  }
}
