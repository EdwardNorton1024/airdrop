import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AirdropModule } from './airdrop/airdrop.module';

@Module({
  imports: [AirdropModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
