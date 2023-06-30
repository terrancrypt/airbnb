import { Global, Module } from '@nestjs/common';
import { PrismaSevice } from './prisma.service';

@Global()
@Module({
  providers: [PrismaSevice],
  exports: [PrismaSevice],
})
export class PrismaModule {}
